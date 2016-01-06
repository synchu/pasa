package com.main

import java.util.UUID

import akka.actor.{Actor, ActorLogging, Props}
import com.task.{DataMgmt, Resource}

class Resourcer extends Actor with ActorLogging {

  import Resourcer._

  //val supervisorActor = context.actorOf(Supervisor.props, "supervisorActor")


  def receive = {
    case Supervisor.MatchResource(product, uuid) => log.info("Match Resource Requested for product {}", product.productName)
      sender() ! resourceMatched(DataMgmt.getResourceByProduct(product), uuid)
    case Start() =>
      log.info("Resourcer started")
    case StopMessage() =>
      log.info("System shutting down")

  }
}


object Resourcer {
  def props = Props[Resourcer]

  final case class resourceMatched(resource: Set[Resource], uuid:UUID)

  final case class Start()

  final case class StopMessage()

}