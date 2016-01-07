


name := """PASA - Planning Automation Software Agents"""

version := "1.0"

scalaVersion := "2.11.7"

dependencyOverrides += "org.scala-lang" % "scala-compiler" % scalaVersion.value

herokuAppName in Compile := "pacific-thicket-3407"

assemblyJarName in assembly := "PASA.jar"

herokuFatJar in Compile := Some((assemblyOutputPath in assembly).value)

enablePlugins(JavaAppPackaging)

val akkaVersion = "2.4.1"//"2.3.12"
val akkaStreamV = "2.0.1"

libraryDependencies ++= Seq(
  "com.typesafe.akka"  %% "akka-actor"                       % akkaVersion,
  "com.typesafe.akka"  %% "akka-testkit"                     % akkaVersion       % "test",
  "com.typesafe.akka"  %% "akka-slf4j"                       % akkaVersion,
  "com.typesafe.akka"  %% "akka-persistence-experimental"    % "2.3.12",
  "com.h2database"     %  "h2"                               % "1.4.190",
  "org.sorm-framework" %  "sorm"                             % "0.3.19", 
  "org.scalatest"      %% "scalatest"                        % "2.2.4"           % "test",
  "com.typesafe.akka" %% "akka-stream-experimental"             % akkaStreamV,
  "com.typesafe.akka" %% "akka-http-core-experimental"          % akkaStreamV,
  "com.typesafe.akka" %% "akka-http-experimental"               % akkaStreamV,
  "com.typesafe.akka" %% "akka-http-spray-json-experimental"    % akkaStreamV,
  "com.typesafe.akka" %% "akka-http-testkit-experimental"       % akkaStreamV
)
  
   

fork in run := true