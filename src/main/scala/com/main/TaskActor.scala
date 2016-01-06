package com.main

import akka.actor._
import com.task.{Resource, TaskDef}
import org.joda.time.DateTime

import scala.collection.mutable.ListBuffer

/**
  * Created by nnyagolov on 25/12/2015.
  */

sealed trait TaskState

case object Unassigned extends TaskState
case object Assigned extends TaskState

case object Working extends TaskState

case object Paused extends TaskState

case object Error extends TaskState

sealed trait TaskMessage

object Assign extends TaskMessage

object Unassign extends TaskMessage

object TaskInfo extends TaskMessage

final case class AssignTo(to: Resource, date: DateTime) extends TaskMessage

final case class Working(actorRef: ActorRef) extends TaskMessage


sealed trait TaskHistory

class AddHistory(task: TaskDef) extends TaskHistory


class TaskActor(taskDef: TaskDef) extends Actor with FSM[TaskState, TaskDef] with ActorLogging {

  import AddHistory._


  startWith(Unassigned, taskDef)

  when(Unassigned) {
    case Event(Unassign, curDef) =>
      goto(Error) using curDef

    case Event(Assign, _) =>
      goto(Assigned) replying "about to assign"

    case Event(AssignTo(to: Resource, date: DateTime), _) => {

      log.info(s"Task data when unassigned was ${stateData}")

      log.info(s"Task Actor Change State received - Actor:${self.toString()}, Current State ${this.stateName}," +
        s" Next state [Assigned] with data ${to}, ${date}, ${stateData.TaskUUID.toString}")


      goto(Assigned) using addHistory(TaskDef(stateData.TaskUUID.toString,
        stateData.TaskName,
        date,
        date.plusMinutes(Capacity.taskCompletionSlot),
        Capacity.taskCompletionSlot, to, stateData.Product))

    }
  }

  when(Assigned) {
    case Event(Assign, _) => {
      log.info(s"Went to assigned $stateData")
      stay replying Assigned
    }
    case Event(Unassign, curDef) => {
      goto(Unassigned) replying "about to unasign"
    }
    case Event(TaskInfo, _) =>
      stay replying stateData
  }

  when(Working) {
    case Event(Assign, _) => {
      stay replying Working
    }
    case Event(Unassign, _) => {
      goto(Unassigned) replying "about to unassign, although working"
    }
  }

  when(Paused) {
    case Event(Assign, _) =>
      self ! Unassign

      goto(Assigned) replying "reassigning"

    case Event(Unassign, _) =>
      goto(Unassigned) replying "about to unassign, although paused"

  }

  onTransition{
    case Unassigned -> Assigned => {
      //testing purposes only - if lastUUID kill em all
      //TODO: remove for production
      if (stateData.TaskUUID == ApplicationMain.lastUUID.toString) {
        log.info(s"System will now shut down")
        log.info(s"Sender ${sender().path.name}")

        //sender() ! Supervisor.StopMessage

      }
    }
  }
  initialize()

}

object AddHistory{

  private var tasks: ListBuffer[TaskDef] = new ListBuffer[TaskDef]()

  def apply(task: TaskDef) = {
    val newTask = new AddHistory(task)
    tasks append task
  }

  def AddTask (task: TaskDef) = {
    tasks append task
    task
  }

  def GetTasks = tasks

  def addHistory(data: TaskDef): TaskDef = {

    val taskAdded = AddTask(data)
    GetTasks.map( x=> println(s" Dumping tasks${x}"))
    taskAdded
  }
}
