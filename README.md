# PASA
An agent support automated task scheduling and planning systems. Scala/AKKA actors backend, React front end 

# PASA system installation, running and configuration

## Installation
There are no particular installation requirements for starting the PASA system. 
**The only _important_ requirement is that you must have latest [Java Runtime](http://www.oracle.com/technetwork/java/javase/overview/index.html)
installed and configured** 

## Building PASA
### Coompiling PASA backend 
sbt (http://www.scala-sbt.org/) interactive build tool can be used to compile and build PASA. 
Once sbt is installed, start it in the core PASA project folder. It will read out the project definition and set the current project to PASA automatically.
Then start the following commands from sbt prompt:
*clean* - cleans any compiled code
*compile* - compiles PASA project. Please, note that first compile may take some time as sbt downloads project dependencies.
*assembly* - this will assemble PASA.jar fat jar file encapsulating the full backend into a single jar file.

### Building PASA front end
In order to build PASA front end, you should have current installation of node.js (https://nodejs.org/en/) and webpack (https://webpack.github.io/). 
Please, go to the respective web pages and follow the instructions to download and install them.
You will need then to execute the following commands within PASA project main folder:
*npm update* - to update/refresh any node.js modules
*webpack* - to produce bundle.js application file

If there are any troubles you may try to rebuild node.js modules (if the node.js version installed is newer than what the modules have been built for).
This is done via executing:
*npm rebuild*

Should the problems continue, please, look on to node.js documentation for cleaning node_modules installation and refreshing module dependencies. 
PASA has fully defined *package.json*. describing all its dependencies and refreshing/reinstalling necessary node.js modules should be straightforward.

## Starting PASA
There are two alternatives to start PASA

### Starting and running PASA in the background
A PASA.jar *fat* jar file has been produced and available in *target\scala-2.11* folder. It can be started by double
clicking the PASA.jar(provided that Java Runtime Environment is installed) on a Microsoft Windows machine, or executing 
PASA.jar directly from the command prompt

### Starting and running PASA with logging
Alternatively, PASA can be started via locating *target\universal\stage\bin* folder and executing
*pasa-planning-automation-software-agents.bat* file on a Windows platform or *pasa-planning-automation-software-agents*
Bash script on Linux or Mac OS X platforms. 
PASA will then run with all the logging information produced by the system printed to the console. More elaborate logging
configuration features (i.e. printing the log to a file, database, event log, etc.) have not yet been implemented.

### Test data
Test data is supplied with PASA within the file testdata.csv. The file is placed within applications' start-up folder for
both of the above described alternatives and is automatically imported at PASA start-up. If the file is not found PASA
still has some data automatically generated during the application start-up. 

### Retrieving information from PASA
Besides utilizing PASA simple front-end, one can retrieve JSON formatted information directly by entering and executing the
following requests via a web browser:
- localhost:9999/products/callback - will return the list of all software products within PASA
- localhost:9999/tasks/callback - will return the list of all planned and distributed tasks within PASA

### Using PASA front-end
Once you've started PASA system you can navigate to *public* folder and open *index.html* in your favorite browser.
While PASA prototype front-end has been designed to work on all browsers, using Mozilla Firefox or Google Chrome is recommended.
Microsoft IE operation cannot be guaranteed.

PASA front-end can be used only after PASA application has been successfully started as the application provides the 
necessary data for the front-end. If the application was not yet completed loading you may need to hit Refresh for the 
front-end to reload.

PASA front-end is rather intuitive so should be self explanatory to navigate through. 
NOTE: In order to avoid installation of the full material design icons set (few hundred MBs) the calendar pop-up used in
PASA details page will appear a bit strange (left and right chevrons are text instead arrows, but is otherwise fully
functional).

### PASA documentation
In addition to the thoroughly commented PASA source code, full documentation in javadoc (actually scaladoc :) ) style is available
in *scala-2.11\api* folder*. You can browse it by opening index.html file in the same folder.

### Stopping PASA
Even the best experience comes to an end.
If you would like to stop PASA then you can use the following alternatives:
- go to "localhost:9999/stop" without the quotation marks at your browser address bar. PASA will return a simple "OK"
message and will terminate itself
- if you have started PASA with the logging option then you can alternatively press Ctrl+C on Windows and Linux machines
to terminate the process

