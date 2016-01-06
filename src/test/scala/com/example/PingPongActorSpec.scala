package com.example

import akka.actor.ActorSystem
import akka.actor.Actor
import akka.actor.Props
import akka.testkit.{ TestActors, TestKit, ImplicitSender }

import org.scalatest.WordSpecLike
import org.scalatest.Matchers
import org.scalatest.BeforeAndAfterAll

import com.main.Supervisor;
import com.main.Resourcer;
 
class PingPongActorSpec(_system: ActorSystem) extends TestKit(_system) with ImplicitSender
  with WordSpecLike with Matchers with BeforeAndAfterAll {
 
  def this() = this(ActorSystem("MySpec"))
 
  override def afterAll {
    TestKit.shutdownActorSystem(system)
  }
 /*
  "A Supervisor actor" must {
    "send resource request" in {
      val pingActor = system.actorOf(Supervisor.props)
      pingActor ! PongActor.PongMessage("pong")
      expectMsg(PingActor.PingMessage("ping"))
    }
  }

  "A Pong actor" must {
    "send back a pong on a ping" in {
      val pongActor = system.actorOf(PongActor.props)
      pongActor ! PingActor.PingMessage("ping")
      expectMsg(PongActor.PongMessage("pong"))
    }
  }
*/
}
