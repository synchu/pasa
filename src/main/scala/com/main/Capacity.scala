package com.main

import java.util.UUID

import akka.actor.{Actor, ActorLogging, Props}
import com.task.{DataMgmt, Resource}
import org.joda.time.DateTime

class Capacity extends Actor with ActorLogging {

  import Capacity._

  val today = new DateTime()
  // task completion slot in minutes
  val taskCompletionSlot = 200

  def receive = {
    case Start() =>
      log.info("Capacity querier started")
    case StopMessage() =>
      log.info("Capacity querier stopped")
    case Supervisor.QueryCapacity(resources: Set[Resource], uuid: UUID) =>


      log.info(s"Capacity asked for resource ${resources.map(x => x.resourceName)}")
      DataMgmt.getResourceCapacity(DateTime.now(), resources, taskCompletionSlot).map {
        x => {
          //TODO: Test and clear as this is possibly redundant - map already flattens the Option returned by getResourceCapacity
          x match {
            // we found the resource
            case a: Map[DateTime, Resource] =>
              log.info(s"Best resource for most recent date to complete task UUID ${uuid.toString} is ${x.toString()}")
              val (date, resource) = a.head
              sender() ! ScheduleTask(resource, date, uuid)

            // not found anything
            case _ => log.warning(s"No resource found for task UUID ${uuid.toString} :( Consider hiring double capacity gurus!")
          }

        }
      }

    /*
    //albeit Future implementation would be great - we would like to make sure that synchronous update of the
    //capacity at the DB is happening
    import scala.concurrent.ExecutionContext.Implicits.global
    val future = Future (DataMgmt.getResourceCapacity(DateTime.now(), resources, taskCompletionSlot))

    future onComplete {
      case Success(f) => f.map( x => println(s"Best resource is ${x._1} at ${x._2}"))
      case Failure(t) => println(t.toString)
    }*/
  }

}


object Capacity {
  val props = Props[Capacity]
  val taskCompletionSlot: Int = Capacity.taskCompletionSlot

  sealed trait Msg

  case class Start() extends Msg

  case class StopMessage() extends Msg

  case class ScheduleTask(resource: Resource, date: DateTime, uuid: UUID) extends Msg

}