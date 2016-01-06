package com.main

import java.util.UUID

import akka.actor._
import akka.pattern.{ask, gracefulStop}
import com.task.{Products, Resource, TaskDef}
import org.joda.time.DateTime

import scala.collection.mutable.ListBuffer
import scala.concurrent.duration._
import scala.concurrent.{Await, Future}

class Supervisor extends Actor with ActorLogging {

  import Supervisor._

  val resourcer = context.actorOf(Resourcer.props, "resourcerActor")
  val capacityQry = context.actorOf(Capacity.props, "capacityActor")


  var runningTaskActors: Map[String, ActorRef] = Map.empty[String, ActorRef]


  def receive = {
    case Start =>
      log.info("Supervisor started")

    case StopMessage =>


      runningTaskActors foreach {
        case (key, value) => {
          log.info(s"Stopping Task Actor ${key}")
          value ! PoisonPill
        }
      }

      import scala.concurrent.ExecutionContext.Implicits.global
      context.children foreach {
        f => {
          log.info(s"Child name ${f.path.name}")
          //  context.unwatch(f)
          try {
            log.info(s"Trying to stop ${f.path.name}")
            val stopped: Future[Boolean] = gracefulStop(f, 5 seconds)
            Await.result(stopped, 7 seconds)
            stopped onSuccess {
              case x => log.info(s"Actor ${f.path.name} stopping result is ${x}")
            }
            stopped onFailure {
              case _ => log.info(s"Actor ${f.path.name} could not be stopped! ${stopped}")
            }


          } catch {
            case e: akka.pattern.AskTimeoutException => log.info(s"Actor ${f.path.name} wasn't stopped")
          }
        }
      }

      log.info(s"Stopping the supervisor ${self.path.name}")
      context.stop(self)

      log.info(s"Stopping the system ${context.system.name}")

      //context.system.terminate().foreach { _ =>
       // log.info("Actor system was shut down")
     // }
      context.system.shutdown()

    case MatchResource(product, _) =>
      log.info("Match Resource")

    case NewTask(product, description, uuid) =>
      log.info("New task request received: " + description)

      //create the task actor for the specific task
      val taskActor = context.actorOf(Props(new TaskActor(TaskDef(uuid.toString, description, product))), uuid.toString)

      runningTaskActors += (uuid.toString -> taskActor)


      //ok lets try to find a resource for the product within the task
      resourcer ! MatchResource(product, uuid)


    case Resourcer.resourceMatched(resources, uuid) =>
      log.info(s"Resource match received ${resources.map(x => x.resourceName)} for task UUID: ${uuid.toString}")
      //we found a resource, some verification going
      val a = runningTaskActors.get(uuid.toString) match {
        case Some(a) => {
          log.debug(s"Task actor's alive, Jim. The force is still strong with us ${uuid.toString}")
          //check what's the most recent date a resource is going to be available
          capacityQry ! QueryCapacity(resources, uuid)
        }
        case None => log.info(s"Task actor's dead, Jim. Task actor's dead ${uuid.toString}")
      }


    case Capacity.ScheduleTask(resource: Resource, date: DateTime, uuid: UUID) =>
      log.info(s"Task ${uuid.toString} is about to be scheduled for resource ${resource.resourceName} at date ${date}")
      //foreach used to flatten the option received, but potentially more than one actor can be live for a task
      // think  about the opportunities;)
      runningTaskActors.get(uuid.toString()).foreach(x => x ! AssignTo(resource, date))

    case DumpTasks =>
      val f: ListBuffer[Future[TaskDef]] = new ListBuffer[Future[TaskDef]]()
      runningTaskActors.map {
        x => {
          println(s"Tasks UUIDs ${x.toString}")
          f append x._2.ask(TaskInfo)(10.seconds).asInstanceOf[Future[TaskDef]]
        }
      }

      sender() ! f


  }


}


object Supervisor {

  val props = Props[Supervisor]

  def RunningTasks(supervisor: Supervisor) = supervisor.runningTaskActors.size != 0

  sealed trait Msg

  case object Start extends Msg

  case object DumpTasks extends Msg

  case object StopMessage extends Msg

  case class NewTask(product: Products, description: String, uUID: UUID) extends Msg

  case class MatchResource(product: Products, uuid: UUID) extends Msg

  case class QueryCapacity(resources: Set[Resource], uuid: UUID) extends Msg

}