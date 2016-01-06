package com.server

import akka.actor._
import akka.event.{Logging, LoggingAdapter}
import akka.http.scaladsl.Http
import akka.http.scaladsl.marshallers.sprayjson.SprayJsonSupport
import akka.http.scaladsl.marshalling.ToResponseMarshallable.apply
import akka.http.scaladsl.model.StatusCodes._
import akka.http.scaladsl.model._
import akka.http.scaladsl.server.Directives._
import akka.pattern.ask
import akka.stream.{ActorMaterializer, Materializer}
import akka.util.Timeout
import com.main.{ApplicationMain, Supervisor}
import com.task._
import com.typesafe.config.{Config, ConfigFactory}
import org.joda.time.DateTime
import spray.json._

import scala.collection.mutable.ListBuffer
import scala.concurrent.duration._
import scala.concurrent.{ExecutionContextExecutor, Future}

/**
  * Created by nnyagolov on 2/1/2016.
  */

case class DumpTasksRequest()

trait Protocols extends DefaultJsonProtocol with SprayJsonSupport {

  implicit object JodaDateTimeFormat extends JsonFormat[DateTime] {
    def write(date: DateTime) = {
      JsString(date.toString("yyyy-MM-dd'T'HH:mm:ss'Z'"))
    }

    def read(value: JsValue) = {
      DateTime.parse(value.toString())
    }
  }

  //this needs a special one as SORM is adding "id" to the object via the Persisted trait, hence default 2 parameter
  //serialization / de-serialization raises an exception
  implicit object ResourceDataFormat extends JsonFormat[Resource] {
    def write(resource: Resource) = {
      JsObject(Map("resourceId" -> JsNumber(resource.resourceId),
        "resourceName" -> JsString(resource.resourceName)))
    }

    def read(value: JsValue) = {
      new Resource(value.asJsObject.getFields("resourceId").head.convertTo[Int], value.asJsObject.getFields("resourceName").head.toString())
    }
  }

  implicit val projectDataFormat = jsonFormat2(ProjectDef.apply)
  implicit val qualificationsDataFormat = jsonFormat2(Qualifications.apply)

  implicit val productsDataFormat = jsonFormat2(Products.apply)
  implicit val tasksDataFormat = jsonFormat10(TaskDef.apply)

}

trait Service extends Protocols {

  implicit val system: ActorSystem

  implicit def executor: ExecutionContextExecutor

  implicit val materializer: Materializer

  implicit val timeout = Timeout(300.seconds)

  def config: Config

  val logger: LoggingAdapter


  lazy val routes = {
    logRequestResult("pasa-schedule") {
      pathPrefix("tasks") {
        (get & path("callback")) {
          onSuccess(ApplicationMain.supervisorActor.ask(Supervisor.DumpTasks)) {

            case r => {
              val k = Future.sequence(r.asInstanceOf[ListBuffer[Future[TaskDef]]].toList)
              onComplete(k) {
                case scala.util.Success(f: List[TaskDef]) =>
                  complete(HttpResponse(OK)
                    .withHeaders(akka.http.scaladsl.model.headers.`Access-Control-Allow-Origin`.*)
                    .withEntity(convertToString(f, false, f.headOption)))
                case scala.util.Failure(errorMessage) => complete(BadRequest -> s"Dont know how to handle this - $errorMessage?")
              }
            }
          }
        }
      } ~
        path("stop") {
          get {
            ApplicationMain.supervisorActor ! Supervisor.StopMessage
            HttpResponse(entity = "Shutting system down!")
            Thread.sleep(2000)
            system.terminate()
            complete(StatusCodes.OK)

          }
        } ~
        pathPrefix("products") {
          (get & path("callback")) {
            onSuccess(DataMgmt.getProducts()) {
              case productsFutureList => {
                complete(HttpResponse(OK)
                  .withHeaders(akka.http.scaladsl.model.headers.`Access-Control-Allow-Origin`.*)
                  .withEntity(convertToString(productsFutureList, false, productsFutureList.headOption)))
              }
            }
          }
        }
    }
  }

  def convertToString(dataList: List[DataObjects], withCallback: Boolean, matchFlag: Option[Any]): String = {

    if (dataList.nonEmpty) {
      val result: String = matchFlag match {
        case Some(a) if matchFlag.get.getClass.getName
          .compare(TaskDef.getClass.getName.substring(0, TaskDef.getClass.getName.length - 1)) == 0
        =>
          dataList.asInstanceOf[List[TaskDef]]
            .map(f => f.toJson)
            .mkString("[", ",", "]")
        case Some(a) if matchFlag.get.getClass.getName
          .compare(Products.getClass.getName.substring(0, Products.getClass.getName.length - 1)) == 0
        =>
          dataList.asInstanceOf[List[Products]]
            .map(f => f.toJson)
            .mkString("[", ",", "]")
        case Some(_) => "[Don't know how to match this]"
        case None => "[Error]"
      }

      if (withCallback) {
        val result1: String = "returnJasonCallback(" + result + ")"
        result1
      } else {
        result
      }
    } else {
      val result: String = "[Empty]"
      result
    }
  }
}


object HttpServer extends Service {
  override implicit val system = ActorSystem()
  override implicit val executor = system.dispatcher
  override implicit val materializer = ActorMaterializer()

  override val config = ConfigFactory.load()
  override val logger = Logging(system, getClass)

  Http().bindAndHandle(routes, config.getString("http.interface"), config.getInt("http.port"))
}
