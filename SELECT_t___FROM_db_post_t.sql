INSERT INTO db.post (author, content, publish_date, title) VALUES ('pc', '# aaa', '2016-03-25 21:37:35', 'second');
INSERT INTO db.post (author, content, publish_date, title) VALUES ('pc', 'aaaaa3', '2016-03-20 20:09:22', 'third');
INSERT INTO db.post (author, content, publish_date, title) VALUES ('pc', 'aaaa', '2016-03-20 20:09:55', 'fourth');
INSERT INTO db.post (author, content, publish_date, title) VALUES ('pc', 'aaaaaa', '2016-03-20 21:21:51', 'sixth');
INSERT INTO db.post (author, content, publish_date, title) VALUES ('pc', '<span id="_testing_angular_js_and_spring_security_part_viii"></span>
# Testing an AngularJS Application

In this article we continue [our discussion][seventh] of how to use [Spring Security](http://projects.spring.io/spring-security) with [Angular JS](http://angularjs.org) in a "single page application". Here we show how to write and run unit tests for the client-side code using the Javascript test framework [Jasmine](http://jasmine.github.io/2.0/introduction.html). This is the eighth in a series of articles, and you can catch up on the basic building blocks of the application or build it from scratch by reading the [first article][first], or you can just go straight to the [source code in Github](https://github.com/dsyer/spring-security-angular/tree/master/basic) (the same source code as Part I, but with tests now added). This article actually has very little code using Spring or Spring Security, but it covers the client-side testing in a way that might not be so easy to find in the usual Javascript community resources, and one which we feel will be comfortable for the majority of Spring users.

As with the rest of this series, the build tools are typical for Spring users, and not so much for experienced front-end developers. Thus we look for solutions that can be used from a Java IDE, and on the command line with familiar Java build tools. If you already know about Jasmine and Javascript testing, and you are happy using a Node.js based toolchain (e.g. `npm`, `grunt` etc.), then you probably can skip this article completely. If you are more comfortable in Eclipse or IntelliJ, and would prefer to use the same tools for your front end as for the back end, then this article will be of interest. When we need a command line (e.g. for continuous integration), we use Maven in the examples here, but Gradle users will probably find the same code easy to integrate.

[first]: https://spring.io/blog/2015/01/12/spring-and-angular-js-a-secure-single-page-application (First Article in the Series)
[second]: https://spring.io/blog/2015/01/12/the-login-page-angular-js-and-spring-security-part-ii (Second Article in the Series)
[sixth]: https://spring.io/blog/2015/03/23/multiple-ui-applications-and-a-gateway-single-page-application-with-spring-and-angular-js-part-vi (Sixth Article in the Series)
[seventh]: https://spring.io/blog/2015/05/13/modularizing-the-client-angular-js-and-spring-security-part-vii (Seventh Article in the Series)

> Reminder: if you are working through this section with the sample application, be sure to clear your browser cache of cookies and HTTP Basic credentials. In Chrome the best way to do that for a single server is to open a new incognito window.

## Writing a Specification in Jasmine

Our "home" controller in the "basic" application is very simple, so it won''t take a lot to test it thoroughly. Here''s a reminder of the code (`hello.js`):

```javascript
angular.module(''hello'', []).controller(''home'', function($scope, $http) {
  $http.get(''resource/'').success(function(data) {
    $scope.greeting = data;
  })
});
```

The main challenge we face is to provide the `$scope` and `$http` objects in the test, so we can make assertions about how they are used in the controller. Actually, even before we face that challenge we need to be able to create a controller instance, so we can test what happens when it loads. Here''s how you can do that.

Create a new file `spec.js` and put it in "src/test/resources/static/js":

```javascript
describe("App", function() {

	beforeEach(module(''hello''));

    var $controller;
	beforeEach(inject(function($injector) {
		$controller = $injector.get(''$controller'');
	}));

	it("loads a controller", function() {
		var controller = $controller(''home'')
	});

}
```

In this very basic test suite we have 3 important elements:

1. We `describe()` the thing that is being tested (the "App" in this case) with a function.

2. Inside that function we provide a couple of `beforeEach()` callbacks, one of which loads the Angular module "hello", and the other of which creates a factory for controllers, which we call `$controller`.

3. Behaviour is expressed through a call to `it()`, where we state in words what the expectation is, and then provide a function that makes assertions.

The test function here is so trivial it actually doesn''t even make assertions, but it does create an instance of the "home" controller, so if that fails then the test will fail.

> NOTE: "src/test/resources/static/js" is a logical place for test code in a Java application, although a case could be made for "src/test/javascript". We will see later why it makes sense to put it in the test classpath, though (indeed if you are used to Spring Boot conventions you may already see why).

Now we need a driver for this Javascript code, in the form of an HTML page that we coudl load in a browser. Create a file called "test.html" and put it in "src/test/resources/static":

```html
<!doctype html>
<html>
<head>

<title>Jasmine Spec Runner</title>
<link rel="stylesheet" type="text/css"
  href="/webjars/jasmine/2.0.0/jasmine.css">
<script type="text/javascript" src="/webjars/jasmine/2.0.0/jasmine.js"></script>
<script type="text/javascript"
  src="/webjars/jasmine/2.0.0/jasmine-html.js"></script>
<script type="text/javascript" src="/webjars/jasmine/2.0.0/boot.js"></script>

<!-- include source files here... -->
<script type="text/javascript" src="/js/angular-bootstrap.js"></script>
<script type="text/javascript" src="/js/hello.js"></script>

<!-- include spec files here... -->
<script type="text/javascript"
  src="/webjars/angularjs/1.3.8/angular-mocks.js"></script>
<script type="text/javascript" src="/js/spec.js"></script>

</head>

<body>
</body>
</html>
```

The HTML is content free, but it loads some Javascript, and it will have a UI once the scripts all run.

First we load the required Jasmine components from `/webjars/**`. The 4 files that we load are just boilerplate - you can do the same thing for any application. To make those available at runtime in a test we will need to add the Jasmine dependency to our "pom.xml":

```xml
<dependency>
  <groupId>org.webjars</groupId>
  <artifactId>jasmine</artifactId>
  <version>2.0.0</version>
  <scope>test</scope>
</dependency>
```

Then we come to the application-specific code. The main source code for our front end is "hello.js" so we have to load that, and also its dependencies in the form of "angular-bootstrap.js" (the latter is created by the wro4j maven plugin, so you need to run `mvn package` once successfully before it is loadable).

Finally we need the "spec.js" that we jsut wrote, and its dependencies (any that are not already included the the other scripts), which for an Angular application will nearly always include the "angular-mocks.js". We load it from webjars, so you will also need to add that dependency to "pom.xml":

```xml
<dependency>
  <groupId>org.webjars</groupId>
  <artifactId>angularjs</artifactId>
  <version>1.3.8</version>
  <scope>test</scope>
</dependency>
```

> NOTE: The angularjs webjar was already included as a dependency of the wro4j plugin, so that it could build the "angular-bootstrap.js". This is going to be used in a different build step, so we need it again.

## Running the Specs

To run our "test.html" code we need a tiny application (e.g. in "src/test/java/test"):

```java
@SpringBootApplication
@Controller
public class TestApplication {

	@RequestMapping("/")
	public String home() {
		return "forward:/test.html";
	}

	public static void main(String[] args) {
		new SpringApplicationBuilder(TestApplication.class).properties(
				"server.port=9999", "security.basic.enabled=false").run(args);
	}

}
```

The `TestApplication` is pure boilerplate: all applications could run tests the same way. You can run it in your IDE and visit [http://localhost:9999](http://localhost:9999) to see the Javascript running. The one `@RequestMapping` we provided just makes the home page display out test HTML. All (one) tests should be green.

Your developer workflow from here would be to make a change to Javascript code and reload the test application in your browser to run the tests. So simple!

## Improving the Unit Test: Mocking HTTP Backend

To improve the spec to production grade we need to actually assert something about what happens when the controller loads. Since it makes a call to `$http.get()` we need to mock that call to avoid having to run the whole application just for a unit test. To do that we use the Angular `$httpBackend` (in "spec.js"):

```javascript
describe("App", function() {

  beforeEach(module(''hello''));

  var $httpBackend, $controller;
  beforeEach(inject(function($injector) {
    $httpBackend = $injector.get(''$httpBackend'');
    $controller = $injector.get(''$controller'');
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it("says Hello Test when controller loads", function() {
    var $scope = {};
    $httpBackend.expectGET(''resource/'').respond(200, {
      id : 4321,
      content : ''Hello Test''
    });
    var controller = $controller(''home'', {
      $scope : $scope
    });
    $httpBackend.flush();
    expect($scope.greeting.content).toEqual(''Hello Test'');
  });

})
```

The new pieces here are:

* The creation of the `$httpBackend` in a `beforeEach()`.

* Adding a new `afterEach()` that verifies the state of the backend.

* In the test function we set expectations for the backend before we create the controller, telling it to expect a call to ''resource/'',and what the response should be.

* We also add a call to jasmine `expect()` to assert the outcome.

Without having to start and stop the test application, this test should now be green in the browser.

## Running Specs on the Command Line

It''s great to be able to run specs in a browser, because there are excellent developer tools built into modern browsers (e.g. F12 in Chrome). You can set breakpoints and inspect variables, and well as being able to refresh the view to re-run your tests in a live server. But this won''t help you with continuous integration: for that you need a way to run the tests from a command line. There is tooling available for whatever build tools you prefer to use, but since we are using Maven here, we will add a plugin to the "pom.xml":

```xml
<plugin>
  <groupId>com.github.searls</groupId>
  <artifactId>jasmine-maven-plugin</artifactId>
  <version>2.0-alpha-01</version>
  <executions>
    <execution>
      <goals>
        <goal>test</goal>
      </goals>
    </execution>
  </executions>
</plugin>
```
The default settings for this plugin won''t work with the static resource layout that we already made, so we need a bit of configuration for that:

```
<plugin>
  ...
  <configuration>
    <additionalContexts>
      <context>
        <contextRoot>/lib</contextRoot>
        <directory>${project.build.directory}/generated-resources/static/js</directory>
      </context>
    </additionalContexts>
    <preloadSources>
      <source>/lib/angular-bootstrap.js</source>
      <source>/webjars/angularjs/1.3.8/angular-mocks.js</source>
    </preloadSources>
    <jsSrcDir>${project.basedir}/src/main/resources/static/js</jsSrcDir>
    <jsTestSrcDir>${project.basedir}/src/test/resources/static/js</jsTestSrcDir>
    <webDriverClassName>org.openqa.selenium.phantomjs.PhantomJSDriver</webDriverClassName>
  </configuration>
</plugin>
```

Notice that the `webDriverClassName` is specified as `PhantomJSDriver`, which means you need `phantomjs` to be on your `PATH` at runtime. This works out of the box in [Travis CI](https://travis-ci.org), and requires a simple installation in Linux, MacOS and Windows - you can [download binaries](http://phantomjs.org/download.html) or use a package manager, like `apt-get` on Ubuntu for instance. In principle, any Selenium web driver can be used here (and the default is `HtmlUnitDriver`), but PhantomJS is probably the best one to use for an Angular application.

We also need to make the Angular library available to the plugin so it can load that "angular-mocks.js" dependency:

```
<plugin>
  ...
  <dependencies>
    <dependency>
      <groupId>org.webjars</groupId>
      <artifactId>angularjs</artifactId>
      <version>1.3.8</version>
    </dependency>
  </dependencies>
</plugin>
```

That''s it. All boilerplate again (so it can go in a parent pom if you want to share the code between multiple projects). Just run it on the command line:

```
$ mvn jasmine:test
```

The tests also run as part of the Maven "test" lifecycle, so you can just run `mvn test` to run all the Java tests as well as the Javascript ones, slotting very smoothly into your existing build and deployment cycle. Here''s the log:

```
$ mvn test
...
[INFO] 
-------------------------------------------------------
 J A S M I N E   S P E C S
-------------------------------------------------------
[INFO] 
App
  says Hello Test when controller loads

Results: 1 specs, 0 failures

[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time: 21.064s
[INFO] Finished at: Sun Apr 26 14:46:14 BST 2015
[INFO] Final Memory: 47M/385M
[INFO] ------------------------------------------------------------------------
```

The Jasmine Maven plugin also comes with a goal `mvn jasmine:bdd` that runs a server that you can load in your browser to run the tests (as an alternative to the `TestApplication` above).

## Conclusion

Being able to run unit tests for Javascript is important in a modern web application and it''s a topic that we''ve ignored (or dodged) up to now in this series. With this installment we have presented the basic ingredients of how to write the tests, how to run them at development time and also, importantly, in a continuous integration setting. The approach we have taken is not going to suit everyone, so please don''t feel bad about doing it in a different way, but make sure you have all those ingredients. The way we did it here will probably feel comfortable to traditional Java enterprise developers, and integrates well with their existing tools and processes, so if you are in that category I hope you will find it useful as a starting point. More examples of testing with Angular and Jasmine can be found in plenty of places on the internet, but the first point of call might be the ["single" sample](https://github.com/dsyer/spring-security-angular/tree/master/single) from this series, which now has some up to date test code which is a bit less trivial than the code we needed to write for the "basic" sample in this article.
', '2016-03-21 00:06:26', 'seventh');
INSERT INTO db.post (author, content, publish_date, title) VALUES ('pc', '[[_spring_and_angular_js_a_secure_single_page_application]]123
= A Secure Single Page Application

In this section we show some nice features of Spring Security, Spring Boot and Angular JS working together to provide a pleasant and secure user experience. It should be accessible to beginners with Spring and Angular JS, but there also is plenty of detail that will be of use to experts in either. This is actually the first in a series of sections on Spring Security and Angular JS, with new features exposed in each one successively. We'll improve on the application in the <<_the_login_page_angular_js_and_spring_security_part_ii,second>> and subsequent installments, but the main changes after this are architectural rather than functional.

== Spring and the Single Page Application

HTML5, rich browser-based features, and the "single page application" are extremely valuable tools for modern developers, but any meaningful interactions will involve a backend server, so as well as static content (HTML, CSS and JavaScript) we are going to need a backend server. The backend server can play any or all of a number of roles: serving static content, sometimes (but not so often these days) rendering dynamic HTML, authenticating users, securing access to protected resources, and (last but not least) interacting with JavaScript in the browser through HTTP and JSON (sometimes referred to as a REST API).

Spring has always been a popular technology for building the backend features (especially in the enterprise), and with the advent of http://projects.spring.io/spring-boot[Spring Boot] things have never been easier. Let's have a look at how to build a new single page application from nothing using Spring Boot, Angular JS and Twitter Bootstrap. There's no particular reason to choose that specific stack, but it is quite popular, especially with the core Spring constituency in enterprise Java shops, so it's a worthwhile starting point.

== Create a New Project

We are going to step through creating this application in some detail, so that anyone who isn't completely au fait with Spring and Angular can follow what is happening. If you prefer to cut to this chase, you can link:#how-does-it-work[skip to the end] where the application is working, and see how it all fits together. There are various options for creating a new project:

* link:#using-curl[Using curl on the command line]
* link:#using-spring-boot-cli[Using Spring Boot CLI]
* link:#using-the-initializr-website[Using the Spring Initializr website]
* link:#using-spring-tool-suite[Using Spring Tool Suite]

The source code for the complete project we are going to build is in https://github.com/dsyer/spring-security-angular/tree/master/basic[Github here], so you can just clone the project and work directly from there if you want. Then jump to the link:#add-a-home-page[next section].

[[using-curl]]
=== Using Curl

The easiest way to create a new project to get started is via the https://start.spring.io[Spring Boot Initializr]. E.g. using curl on a UN*X like system:

[source]
----
$ mkdir ui && cd ui
$ curl https://start.spring.io/starter.tgz -d style=web \\
-d style=security -d name=ui | tar -xzvf - 
----

You can then import that project (it's a normal Maven Java project by default) into your favourite IDE, or just work with the files and "mvn" on the command line. Then jump to the link:#add-a-home-page[next section].

[[using-spring-boot-cli]]
=== Using Spring Boot CLI

You can create the same project using the http://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/#getting-started-installing-the-cli[Spring Boot CLI], like this:

[source]
----
$ spring init --dependencies web,security ui/ && cd ui
----

Then jump to the link:#add-a-home-page[next section].

[[using-the-initializr-website]]
=== Using the Initializr Website

If you prefer you can also get the same code directly as a .zip file from the https://start.spring.io[Spring Boot Initializr]. Just open it up in your browser and select dependencies "Web" and "Security", then click on "Generate Project". The .zip file contains a standard Maven or Gradle project in the root directory, so you might want to create an empty directory before you unpack it. Then jump to the link:#add-a-home-page[next section].

[[using-spring-tool-suite]]
=== Using Spring Tool Suite

In http://spring.io/tools/sts[Spring Tool Suite] (a set of Eclipse plugins) you can also create and import a project using a wizard at `File-&gt;New-&gt;Spring Starter Project`. Then jump to the link:#add-a-home-page[next section].

[[add-a-home-page]]
== Add a Home Page

The core of a single page application is a static "index.html", so let's go ahead and create one (in "src/main/resources/static" or "src/main/resources/public"):

.index.html
[source,html]
----
<!doctype html>
<html>
<head>
<title>Hello AngularJS</title>
<link href="css/angular-bootstrap.css" rel="stylesheet">
<style type="text/css">
[ng\\:cloak], [ng-cloak], .ng-cloak {
  display: none !important;
}
</style>
</head>

<body ng-app="hello">
  <div class="container">
    <h1>Greeting</h1>
    <div ng-controller="home" ng-cloak class="ng-cloak">
      <p>The ID is {{greeting.id}}</p>
      <p>The content is {{greeting.content}}</p>
    </div>
  </div>
  <script src="js/angular-bootstrap.js" type="text/javascript"></script>
  <script src="js/hello.js"></script>
</body>
</html>
----

It's pretty short and sweet because it is just going to say "Hello World".

=== Features of the Home Page

Salient features include:

* Some CSS imported in the `&lt;head&gt;`, one placeholder for a file that doesn't yet exist, but is named suggestively ("angular-bootstrap.css") and one inline stylesheet defining the https://docs.angularjs.org/api/ng/directive/ngCloak["ng-cloak"] class.

* The "ng-cloak" class is applied to the content `&lt;div&gt;` so that dynamic content is hidden until Angular JS has had a chance to process it (this prevents "flickering" during the initial page load).

* The `&lt;body&gt;` is marked as `ng-app=&quot;hello&quot;` which means we need to define a JavaScript module that Angular will recognise as an application called "hello".

* All the CSS classes (apart from "ng-cloak") are from http://getbootstrap.com/[Twitter Bootstrap]. They will make things look pretty once we get the right stylesheets set up.

* The content in the greeting is marked up using handlebars, e.g. `{{greeting.content}}` and this will be filled in later by Angular (using a "controller" called "home" according to the `ng-controller` directive on the surrounding `&lt;div&gt;`).

* Angular JS (and Twitter Bootstrap) are included at the bottom of the `&lt;body&gt;` so that the browser can process all the HTML before it gets processed.

* We also include a separate "hello.js" which is where we are going to define the application behaviour.

We are going to create the script and stylesheet assets in a minute, but for now we can ignore the fact that they don't exist.

=== Running the Application

Once the home page file is added, your application will be loadable in a browser (even though it doesn't do much yet). On the command line you can do this

[source]
----
$ mvn spring-boot:run
----

and go to a browser at http://localhost:8080[http://localhost:8080]. When you load the home page you should get a browser dialog asking for username and password (the username is "user" and the password is printed in the console logs on startup). There's actually no content yet, so you should get a blank page with a "Greeting" header once you successfully authenticate.

TIP: If you don't like scraping the console log for the password just add this to the "application.properties" (in "src/main/resources"): `security.user.password=password` (and choose your own password). We did this in the sample code using "application.yml".

In an IDE, just run the `main()` method in the application class (there is only one class, and it is called `UiApplication` if you used the "curl" command above).

To package and run as a standalone JAR, you can do this:


```
$ mvn package
$ java -jar target/*.jar
```

== Front End Assets

Entry-level tutorials on Angular and other front end technologies often just include the library assets directly from the internet (e.g. https://docs.angularjs.org/misc/downloading[the Angular JS website] itself recommends downloading from https://ajax.googleapis.com/ajax/libs/angularjs/1.2.0/angular.min.js[Google CDN]). Instead of doing that we are going to generate the "angular-bootstrap.js" asset by concatenating several files from such libraries. This is not strictly necessary to get the application working, but it _is_ best practice for a production application to consolidate scripts to avoid chatter between the browser and the server (or content delivery network). Since we aren't modifying or customizing the CSS stylesheets it is also unecessary to generate the "angular-bootstrap.css", and we could just use static assets from Google CDN for that as well. However, in a real application we almost certainly would want to modify the stylesheets and we wouldn't want to edit the CSS sources by hand, so we would use a higher level tool (e.g. http://lesscss.org/[Less] or http://sass-lang.com/[Sass]), so we are going to use one too.

There are many different ways of doing this, but for the purposes of this section, we are going to use http://alexo.github.io/wro4j/[wro4j], which is a Java-based toolchain for preprocessing and packaging front end assets. It can be used as a JIT (Just in Time) `Filter` in any Servlet application, but it also has good support for build tools like Maven and Eclipse, and that is how we are going to use it. So we are going to build static resource files and bundle them in our application JAR.

____
Aside: Wro4j is probably not the tool of choice for hard-core front end developers - they would probably be using a node-based toolchain, with http://bower.io/[bower] and/or http://gruntjs.com/[grunt]. These are definitely excellent tools, and covered in great detail all over the internet, so please feel free to use them if you prefer. If you just put the outputs from those toolchains in "src/main/resources/static" then it will all work. I find wro4j comfortable because I am not a hard-core front end developer and I know how to use Java-based tooling.
____

To create static resources at build time we add some magic to the Maven `pom.xml` (it's quite verbose, but boilerplate, so it could be extracted into a parent pom in Maven, or a shared task or plugin for Gradle):


``` 
<build>
  <resources>
    <resource>
      <directory>${project.basedir}/src/main/resources</directory>
    </resource>
    <resource>
      <directory>${project.build.directory}/generated-resources</directory>
    </resource>
  </resources>
  <plugins>
    <plugin>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-maven-plugin</artifactId>
    </plugin>
    <plugin>
      <artifactId>maven-resources-plugin</artifactId>
      <executions>
        <execution>
          <!-- Serves *only* to filter the wro.xml so it can get an absolute 
            path for the project -->
          <id>copy-resources</id>
          <phase>validate</phase>
          <goals>
            <goal>copy-resources</goal>
          </goals>
          <configuration>
            <outputDirectory>${basedir}/target/wro</outputDirectory>
            <resources>
              <resource>
                <directory>src/main/wro</directory>
                <filtering>true</filtering>
              </resource>
            </resources>
          </configuration>
        </execution>
      </executions>
    </plugin>
    <plugin>
      <groupId>ro.isdc.wro4j</groupId>
      <artifactId>wro4j-maven-plugin</artifactId>
      <version>1.7.6</version>
      <executions>
        <execution>
          <phase>generate-resources</phase>
          <goals>
            <goal>run</goal>
          </goals>
        </execution>
      </executions>
      <configuration>
        <wroManagerFactory>ro.isdc.wro.maven.plugin.manager.factory.ConfigurableWroManagerFactory</wroManagerFactory>
        <cssDestinationFolder>${project.build.directory}/generated-resources/static/css</cssDestinationFolder>
        <jsDestinationFolder>${project.build.directory}/generated-resources/static/js</jsDestinationFolder>
        <wroFile>${project.build.directory}/wro/wro.xml</wroFile>
        <extraConfigFile>${basedir}/src/main/wro/wro.properties</extraConfigFile>
        <contextFolder>${basedir}/src/main/wro</contextFolder>
      </configuration>
      <dependencies>
        <dependency>
          <groupId>org.webjars</groupId>
          <artifactId>jquery</artifactId>
          <version>2.1.1</version>
        </dependency>
        <dependency>
          <groupId>org.webjars</groupId>
          <artifactId>angularjs</artifactId>
          <version>1.3.8</version>
        </dependency>
        <dependency>
          <groupId>org.webjars</groupId>
          <artifactId>bootstrap</artifactId>
          <version>3.2.0</version>
        </dependency>
      </dependencies>
    </plugin>
  </plugins>
</build>
```

You can copy that verbatim into your POM, or just scan it if you are following along from the https://github.com/dsyer/spring-security-angular/tree/master/basic/pom.xml#L43[source in Github]. The main points are:

* We are including some webjars libraries as dependencies (jquery and bootstrap for CSS and styling, and Angular JS for business logic). Some of the static resources in those jar files will be included in our generated "angular-bootstrap.*" files, but the jars themselves don't need to be packaged with the application.

* Twitter Bootstrap has a dependency on jQuery, so we include that as well. An Angular JS application that didn't use Bootstrap wouldn't need that since Angular has its own version of the features it needs from jQuery.

* The generated resources will go in "target/generated-resources", and because that is declared in the `&lt;resources/&gt;` section, they will be packaged in the output JAR from the project, and available on the classpath in the IDE (as long as we are using Maven tooling, e.g. m2e in Eclipse).
', '2016-03-21 15:43:52', 'A Secure Single Page Application');
INSERT INTO db.post (author, content, publish_date, title) VALUES ('pc', '> utils: makedown [Cheatsheet](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet) and [github](https://help.github.com/categories/writing-on-github/)

1. 中文输入 done [fixed](http://dev.mysql.com/doc/refman/5.7/en/charset-unicode-utf8mb3.html)
2. 权限 done
  * On the sever side, use the [spring security and sping data rest](https://github.com/spring-projects/spring-data-examples/tree/master/rest/security).
    I have some rest services that front framework 
    *( I use the angular.js )*  can fetch by Json data format.
    But there are some method such as update, delete that I don''t want anyone 
    to access them except **Administrator**.
 * On the client side, [see here](https://spring.io/blog/2015/01/12/the-login-page-angular-js-and-spring-security-part-ii)
3. 页面导航前进后退选项以及页面的数目导航条 done using [angualr-bootstrap ui](https://angular-ui.github.io/bootstrap/)

4. Personal social interactive done
5. How to exposed the entity id to Restful service [mehtod](http://tommyziegler.com/how-to-expose-the-resourceid-with-spring-data-rest/)  
   Here the method is deprecated, and it can''t work with spring boot properties file, 
   so it means that if you use this method you can''t setting spring data rest by using .yml file.
   After that I find another class which is the similar to fix it, the code snippet here:     
   
        @Configuration
        public class RepoConfig extends RepositoryRestConfigurerAdapter {

        @Override
        public void configureRepositoryRestConfiguration(RepositoryRestConfiguration config) {
                config.exposeIdsFor(Post.class);
            }
        }
        
6. Try to add `tag` attribute to the `Post` and some action with `tag`  

    backend side:  
    * add `tag` attribute to the post entity and setting databse
    * add the fetch method in the `blogReopsitory`  
        * [how to exposed the pageable result by tag](http://docs.spring.io/spring-data/rest/docs/2.4.4.RELEASE/reference/html/#_paging)
      
  front end side  
    * in blog state, add search by tag type
    * attach tag to every blog
    
7. For the scurity, save the Administrator name and password into the database.
8. Write test. This should be the fist task when you write the program.
9. In some time, there are some data in post that I don''t need, such as in the blog list, I don''t need
    to retrive the blog''s content in my query. [Look here](http://docs.spring.io/spring-data/rest/docs/2.4.4.RELEASE/reference/html/#projections-excerpts.projections)





', '2016-03-26 17:08:36', 'To do');
INSERT INTO db.post (author, content, publish_date, title) VALUES ('pc', '>To be a good programmer, I find that I have a lot of things should to do. So I decided
to write some book review to record this jounery.  

This is my first reading book Head First Design Pattern.

### 我们如何使用设计模式  

设计模式并不能在你的代码中直接体现，他们应该首先出现在你的大脑中。你需要将你在工作中用过的设计模式应用在你的新工程中，并且运用你所学的设计模式去尝试重构你以前的陈旧代码。

---
### 第一章  
*通过一个简单的例子, 一步一步添加各种元素，最后引出并介绍了STRATEGY pattern.*

**Scenario**: 

我们有一项任务，一个叫simUDUCK的App游戏应用，定义了一个`abstract class` 叫做 
`duck.java` 我们的游戏就是基于这个class，利用oop思想产生了各种类的duck，
但随着时间的发展，我们发现一款产品如果持续不更新就意味着死亡，
所以需要对我们的产品进行快速的迭代更新，经过一周的回忆讨论高层决定给鸭子们增加飞行的能力.  

**Soluction**:  

* 这里需要思考几个问题

  1. 如果我们只是单纯的向duck这个`abstrct class`直接添加一个`fly()`会发生什么？（inheritance）
  2. 将fly方法提取成interface，然后让duck装置这个方法？  


* 最后提出了一种想法就是将不变的方法变量统一封装（encapsulation），将变化的量变为
属性在创建实体时动态的注入到实体中。

* 文章中经过了多次的修正，这里我只将最终的结果展示出来
<img src="/pic/hf1.png" width="auto" height="500" />  
* 通过向duck添加的`fly`和`quack`的interface属性，并且能在初始化duck实体，
甚至在程序运行时注入interface的装置来为不同的duck改变属性.

**Finally, what is that ?**  
   * The STRATEGY Pattern defines a family of algorithms, emcapsulates each one and make
them interchangeable. Strategy lets the algorithm vary independently from clients
that use it.
---
正如文中所说：
> Design Pattern give you a shared vocabulary with other developers. Once you got the vocabulary you can more easily communicate with other devlopers and inspire those who don''t know patterns to start learning them. It also elvate your thinking about architectures by letting you think at the **pattern level**,not the nitty gritty *object* level.

', '2016-03-28 15:41:43', 'Head First Design Pattern Review(一)');
INSERT INTO db.post (author, content, publish_date, title) VALUES ('pc', '1. **这里我先把observer pattern的定义先给出**:  

    * observer定义了一种“一对多”的依赖关系，当其中的“一”状态改变时，它的"多"个依赖将会自动的更新。  
    
    * 这种关系有点像我们日常生活中的订阅系统，当你选择订阅某种消息后，只要消息发生更新就会及时发送给订阅者。这里消息的发布者可以看作“一”，而消息的接受者可以有“多”个。
    
    * 这种模式带来的好处就是解耦。
      * *松耦合的设计使我们能够构建更加自由交互的OO系统。*

2. **Example**:
    * 需求分析：  
    我们收到一份需求（具体内容略）经过对客户的需求分析我们总结出来我们程序需要实现的功能。
    这个程序我们称为`The weather Monitorning application`, 它分为3部分收集数据、处理数据、展示数据。这里我们的重点放在处理、展示数据方面。  
    
    其中处理数据我们将其抽象化为一个class `WeatherData.class` 这个java class需要实现拉取数据以及对数据的变化进行实时的反应，并将结果传递给展示层。
    
    * 实现  
    根据需求分析，设计我们的程序，这里将直接使用observer pattern进行设计。  
    首先，建立`interface`
    ```java
    public interface Subject(){
        public void registerObserver(Observer o); //注册observer
        public void removeObserver(Observer o);   //删除observer
        public void notifyObservers();            //当subject状态改变时，通知所有observer
    }
    ```
    
    ```java
    public interface Observer(){
        public void update(float temp, float humidity, float pressure);
    }
    ```
    
    ```java
    public interface DisplayElement(){
        public void display();
    }
    ```
    给`WeatherData.class`装置`Subject`  
    
    ```java
    public class WeatherData implements Subject{
        private ArrayList observers;
        private float temperature;
        private float humidity;
        private float pressure;
        
        public WeatherData(){
            observers = new ArrayList();
        }
        
        public registerObserver(Observer o){
            observers.add(o);
        }
        
        public removeObserver(Observer o){
            int i = observers.indexOf(o);
            if( i >= 0 ){
                observers.remove(i);
            }
        }
        
        public void notifyObservers(){
            for(int i = 0; i< observers.size(); i++){
                Observer observer = (Observer)observers.get(i);
                observer.update(temperature, humidity, pressure);
            }
        }
        
        public void measurementsChanged(){
            notifyObservers();
        }
        
        public void setMeasurements(float temperature, float humidity, float pressure){
            this.temperature = temperature;
            this.humidity = humidity;
            this.pressure = pressure;
            measurementsChanged();
        }
        //other WeatherData methods here
    }
    ```
    
    接下来将要构建显示元素：  
    ```java
    public class CurrentConditionsDisplay implements Observer, DisplayElement{
        private float temperature;
        private float humidity;
        private float pressure;
        private Subject weatherData;
        
        public CurrentConditionsDisplay(Subject weatherData){
            this.weatherData = weatherData;
            weatherData.registerObserver(this);
        }
        
        public void update(float temperature, float humidity, float pressure){
            this.temperature = temperature;
            this.humidity = humidity;
            display();
        }
        
        public void display(){
            System.out.println("Current condicitons: " + temperature 
            + "F degrees and " + humidity + "% humidity");
        }
    }
    ```
    
3. **写在最后**  
    * 其实java有其内建的observer pattern方法， 可以进JDK去查看`observable`和`observer`，其中第一个是class第二个是interface，提供了一些已经写好的方法。
    但是在有些情况下，内建的java 方法有其不足的地方，例如 
    
      1. `observer`是class形式出现的继承这种方法后就不能在继承其他方法使得程序的扩展性变差。
    
      2. `observer`中的有些方法像是 setChange() 是被protected修饰的，只有`observer`的subclass才能访问它，这就对你的程序又产生了限制。  
      
  * 所以,有时需要你自己实现observer pattern或者使用内建的方法需要根据你的需求来决定。使用那种实现方式并不重要，只要理解设计模式能够很好的使用它，就会使你的程序逻辑更加清晰明了。
    
    
    
    
    
    
    
    
    
    ', '2016-03-29 13:21:23', 'Head First Design Pattern: Observer Pattern (二)');
INSERT INTO db.post (author, content, publish_date, title) VALUES ('pc', '介绍java 8 的一些新的功能。  
1. **Interface的默认方法**

    在以前的java中，我们只能出现abstract method并不能有其具体的实现。而在java 8 中允许我们使用关键字`default`添加非抽象方法。这个新的特点被称作__扩展方法__:
    
    ```java
    interface Formula{
        double calculate(int a);

        default double sqrt(int a) {
            return Math.sqrt(a);
        }
    }
    ```
    例子中，`interface`装置了抽象方法`calculate`同时也定义了default method叫做`sqrt`，而`sqrt`方法能够直接开箱使用。
    
    ```java
    Formula formula = new Formula() {
        @Override
        public double calculate(int a) {
            return sqrt(a * 100);
        }
    };

    formula.calculate(100);     // 100.0
    formula.sqrt(16);           // 4.0
    ```
    这里formula以匿名的方法类装载，格式冗长。后面将会介绍，在java 8 中的改进语法。', '2016-03-30 14:33:20', 'Java 8 指南');