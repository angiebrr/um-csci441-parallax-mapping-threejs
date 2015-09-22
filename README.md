# README #

Using TerrainGenerator to procedurally generate random terrain, this scene emulates a 3D effect with a given texture by using normal and parallax mapping. For more information on the shader, consult TerrainShader.js.

This was created for a graduate-level computer science graphics course, and so there is a paper in the source (Gross_Angela_Project_2_Paper.pdf) that describes the project process, methods, and underlying theory behind the project. Also, it has a great deal of photos of the end result of the project.

![normal_parallax_mapping.PNG](https://bitbucket.org/repo/jX5bo4/images/2816976925-normal_parallax_mapping.PNG)

### How do I get set up? ###

You need to have a WebGL enabled browser. Additionally, you need to make sure that your browser can read local files. Here are some instructions for Chrome from [this site](http://www.chrome-allow-file-access-from-file.com/):

**On Windows Operating System**

* Get the url of your Chrome Installation  path to your chrome installation e.g C:\Users\-your-user-name\AppData\Local\Google\Chrome\Application>
* Launch the Google Chrome browser from the command line window with the additional argument ‘–allow-file-access-from-files’. E.g ‘path to your chrome installation\chrome.exe --allow-file-access-from-files’
* Temporary method you can use each time you are testing
* Copy the existing chrome launcher
* Do as above and save it with a new name e.g chrome - testing
* Alternatively, you can simply create a new launcher with the above and use it to start chrome.

**On Linux Operating System (specifically UBUNTU)**

* Go to the menu entry/ launcher for Chrome (.desktop file)
* Open the launcher properties dialog.
* It should look something like this: ‘/usr/bin/google-chrome %U’
* Change it to ‘/usr/bin/google-chrome --allow-access-from-files‘ to make the flags work permanently
* You may also need to delete and re-pin your launcher(s) after modifying it. Chrome should launch with the specified flags enabled after the modification.

Once all of that is done, you can see this project in action by simply clicking "index.html".