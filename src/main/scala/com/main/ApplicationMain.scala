package com.main


import akka.actor.{ActorSystem, _}
import com.task.Products


object ApplicationMain extends App {

  val tasks = com.task.DataMgmt

  //for testing purposes only - used to identify the last message and kill the system
  val lastUUID = uuid

  val system = ActorSystem("PASASystem")

  //task uuid generator
  def uuid = java.util.UUID.randomUUID

  val serv = com.server.HttpServer

  val supervisorActor = system.actorOf(Supervisor.props, "supervisorActor")


  supervisorActor ! Supervisor.Start
  supervisorActor ! Supervisor.NewTask(Products(2, "Time nuker"), "A big problem with Time Nuker", uuid)
  supervisorActor ! Supervisor.NewTask(Products(2, "Time nuker"), "A smaller problem with Time Nuker", uuid)
  supervisorActor ! Supervisor.NewTask(Products(3, "Governance portal"), "Some problem with Time Nuker", uuid)
  supervisorActor ! Supervisor.NewTask(Products(2, "Time nuker"), "Another problem with Time Nuker", uuid)
  supervisorActor ! Supervisor.NewTask(Products(3, "Governance portal"), "Some even nastier problem with Time Nuker", uuid)
  supervisorActor ! Supervisor.NewTask(Products(2, "Time nuker"), "A very small problem with Time Nuker", uuid)
  supervisorActor ! Supervisor.NewTask(Products(3, "Governance portal"), "An issue with Time Nuker", lastUUID)




  //Await.result(system.terminate(), 300.seconds)
  system.awaitTermination()

  def addNewTask(forProduct: Products, TaskDescription: String) = {

    if (supervisorActor ne null) {
      supervisorActor ! Supervisor.NewTask(forProduct, TaskDescription, uuid)
    }

  }


}