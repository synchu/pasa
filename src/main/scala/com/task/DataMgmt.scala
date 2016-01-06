package com.task

import org.joda.time.DateTime
import sorm._

import scala.concurrent.{ExecutionContext, Future}

case class TaskDef(project: ProjectDef = ProjectDef(projectId = 0, projectName = ""),
                   TaskUUID: String = "", TaskName: String = "", TaskDescription: String = "",
                   TaskStart: DateTime = new DateTime(0), TaskEnd: DateTime = new DateTime(0), Duration: Int = 0,
                   Quals: Seq[Qualifications] = Seq(Qualifications(qualId = 0, qualName = "")),
                   Responsible: Resource = Resource(resourceId = 0, resourceName = ""),
                   Product: Products = Products()) extends DataObjects {
  def this(TaskUUID: String, TaskName: String, TaskStart: DateTime, TaskEnd: DateTime, Duration: Int, Responsible: Resource, Product: Products) =
    this(ProjectDef(projectId = 0, projectName = ""),
      TaskUUID, TaskName, TaskName,
      TaskStart, TaskEnd, Duration,
      Seq(Qualifications(qualId = 0, qualName = "")),
      Responsible,
      Product)

  def this(TaskUUID: String, TaskName: String, Product: Products) =
    this(ProjectDef(projectId = 0, projectName = ""),
      TaskUUID, TaskName, TaskName,
      new DateTime(0), new DateTime(0), 0,
      Seq(Qualifications(qualId = 0, qualName = "")),
      Resource(),
      Product)
}

sealed trait DataObjects

case class ProjectDef(projectId: Int = 0, projectName: String = "")

case class Calendar(date: DateTime = new DateTime(0), resource: Resource = Resource(), capacity: Int = 0)

case class Resource(resourceId: Int = 0, resourceName: String = "")

case class Qualifications(qualId: Int = 0, qualName: String = "")

case class ResourceQuals(qual: Qualifications = Qualifications(), resource: Resource = Resource())

case class Products(productId: Int = 0, productName: String = "") extends DataObjects

case class ProductQuals(product: Products = Products(), qual: Qualifications = Qualifications())

case class Schedule(date: DateTime = new DateTime(), task: TaskDef = TaskDef())


class DataMgmt {

  val debug = false

  //init resources, projects
  val res = Seq(Resource(1, "Ivan"),
    Resource(2, "Peter"),
    Resource(3, "Adam"))

  val proj = ProjectDef(1, "A sample project")

  val quals = Seq(Qualifications(1, "Java"),
    Qualifications(2, "JavaScript"),
    Qualifications(3, "Scala"))


  val resQuals = Seq(
    ResourceQuals(Qualifications(1, "Java"), Resource(1, "Ivan")),
    ResourceQuals(Qualifications(2, "JavaScript"), Resource(1, "Ivan")),
    ResourceQuals(Qualifications(3, "Scala"), Resource(2, "Peter")),
    ResourceQuals(Qualifications(2, "JavaScript"), Resource(2, "Peter"))
  )

  val prds = Seq(Products(1, "Timesheet system"),
    Products(2, "Time nuker"),
    Products(3, "Governance portal"))

  val prdQuals = Seq(ProductQuals(Products(1, "Timesheet system"), Qualifications(1, "Java")),
    ProductQuals(Products(1, "Timesheet system"), Qualifications(2, "JavaScript")),
    ProductQuals(Products(2, "Time nuker"), Qualifications(1, "Java")),
    ProductQuals(Products(2, "Time nuker"), Qualifications(2, "JavaScript")),
    ProductQuals(Products(3, "Governance portal"), Qualifications(1, "Java")),
    ProductQuals(Products(3, "Governance portal"), Qualifications(2, "JavaScript")),
    ProductQuals(Products(3, "Governance portal"), Qualifications(3, "Scala"))
  )

  //save resources to DB
  Db.save(proj)

  res.foreach {
    Db.save[Resource]
  }
  quals.foreach {
    Db.save[Qualifications]
  }

  //verify resources and quals are saved
  if (debug) println(s"Resource count is ${Db.query[Resource].count()}")
  Db.query[Resource].fetch().foreach { x => println(x.toString()) }
  if (debug) println(s"Quals count is ${Db.query[Qualifications].count()}")
  Db.query[Qualifications].fetch().foreach { x => println(x.toString()) }

  //save resource qualifications mapping
  for (rq <- resQuals) {
    val rs = Db.query[Resource].whereEqual("resourceId", rq.resource.resourceId).fetchOne()
    val ql = Db.query[Qualifications].whereEqual("qualId", rq.qual.qualId).fetchOne()

    Db.save[ResourceQuals](ResourceQuals(ql.get, rs.get))
  }

  //save products
  prds.foreach {
    Db.save
  }

  for (prd <- prdQuals) {

    val pr = Db.query[Products].whereEqual("productId", prd.product.productId).fetchOne()
    val ql = Db.query[Qualifications].whereEqual("qualId", prd.qual.qualId).fetchOne()

    Db.save[ProductQuals](ProductQuals(pr.get, ql.get))
  }

  if (debug) Db.query[ProductQuals].fetch().foreach(x => println(x.toString()))


  var cal = List(Calendar(org.joda.time.DateTime.now(), Resource(0, ""), 0))


  def Init(): Unit = {

    if (debug) println("Init data")

    //calendar init      
    var a = 1
    for (a <- 1 to 10) {
      var b = 1
      for (b <- 1 to 3) {
        cal = addCalEntry(Calendar(org.joda.time.DateTime.now().plusDays(a), Db.query[Resource].whereEqual("resourceId", b).fetchOne().get, 480))
      }
    }
  }

  //init calendar entry
  def addCalEntry(pcal: Calendar): List[Calendar] = {
    Db.save(pcal);
    cal :+ pcal
  }

  //print calendar
  def printCal(): Unit = {
    if (debug) Db.query[Calendar].fetch().map(c => (c.date, c.resource.toString(), c.capacity)).foreach(println)
  }


}

/**
  * @author nnyagolov
  */
object DataMgmt {

  val task = new DataMgmt()
  task.Init();
  task.printCal();

  /**
    *
    * @param product
    * @return
    */
  def getResourceByProduct(product: Products): Set[Resource] = {

    if (task.debug) println(s"DB is now looking for resource for product ${product.productName}")

    val qualsPerProduct: Vector[ProductQuals] = Db.query[ProductQuals]
      .whereEqual("product.productName", product.productName)
      .fetch().toVector

    if (task.debug) qualsPerProduct.foreach(x => println(s"DB Found: Quals needed for the product ${product.productName} are: ${x.qual.qualName}"))

    qualsPerProduct.flatMap(x => Db.query[ResourceQuals]
      .whereEqual("qual.qualId", x.qual.qualId)
      .fetch()).foldLeft[Set[Resource]](Set.empty[Resource]) { (z, f) => z + f.resource }

  }

  def getResourceCapacity(dateTime: DateTime, resources: Set[Resource], taskCompletionSlot: Int): Option[Map[DateTime, Resource]] = {

    implicit def calendarOrdering: Ordering[Calendar] = Ordering.fromLessThan(_.date isBefore _.date)

    val availableDates = resources.map(x =>
      Db.query[Calendar]
        .whereEqual("resource.resourceId", x.resourceId)
        .whereLargerOrEqual("date", dateTime)
        .whereLargerOrEqual("capacity", taskCompletionSlot)
        .fetchOne().getOrElse(new DateTime(9999, 12, 12, 12, 12)))

    if (availableDates.isEmpty || (availableDates.size == 1 && availableDates(0).asInstanceOf[Calendar].date.isEqual(new DateTime(9999, 12, 12, 12, 12)))) {
      //hadn't found anything - get back with none
      None
    } else {
      //get most recent date when a qualified resource is available
      val bestResource = availableDates.asInstanceOf[Set[Calendar]].min
      //update daily capacity for the particular resource, subtracting the taskCompletionSlot
      Db.save[Calendar](bestResource.copy(bestResource.date, bestResource.resource, bestResource.capacity - taskCompletionSlot))
      //return the resource and the most recent date
      Some(Map(bestResource.date -> bestResource.resource))
    }
  }


  def getProducts()(implicit ec: ExecutionContext): Future[List[Products]] = {
    Future(Db.query[Products].fetch().map( f => Products(f.productId, f.productName)).toList)
  }
}

object TaskDef {
  def apply(TaskUUID: String, TaskName: String, TaskStart: DateTime, TaskEnd: DateTime, Duration: Int, Responsible: Resource, Product: Products) =
    new TaskDef(TaskUUID, TaskName, TaskStart, TaskEnd, Duration, Responsible, Product)

  def apply(TaskUUID: String, TaskName: String, Product: Products) =
    new TaskDef(TaskUUID, TaskName, Product)


}

//import sorm library for simple database manipulation and declare the database object, including all entities

object Db extends Instance(

  entities = Set(Entity[Calendar](),
    Entity[Resource](),
    Entity[TaskDef](),
    Entity[ProjectDef](),
    Entity[Qualifications](),
    Entity[ResourceQuals](),
    Entity[Products](),
    Entity[ProductQuals](),
    Entity[Schedule]()),
  user = "",
  password = "",
  initMode = InitMode.Create,
  url = "jdbc:h2:mem:test")
