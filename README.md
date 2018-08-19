# ChooseYourStory Chrome Extension

## How To:

**This extension is made for the Google Chrome web-browser**

1) Go to https://github.com/Praxibetel/CYSCE
2) Click the green **[Clone or Download]** button
	- a dropdown menu will appear
3) Click **[Download ZIP]**
	- If on windows, you do not need 7zip to properly extract what is inside the zipped folder
	- Save the file wherever you want (we suggest somewhere easy to navigate to)
4) Open your file explorer (on windows: click the yellow manilla folder icon)
	- On some systems, the file explorer may automatically open to show you the file you downloaded
	- If you saved the folder to your desktop, you can skip this step
5) Navigate to and **right click on the zipped folder**
	- Choose **"Extract Here"**
	- If you'd like to extract somewhere else, click "extract" and specify where you want the extension to be saved.
	- A folder named CYSCE-master should appear where you extracted the folder
6) Go back into Chrome and visit **chrome://extensions/**
	- This is the extensions settings for Chrome
7) **Enable Developer Mode** (usually a button towards the top right of the page)
	- If you share a computer with a tech-savvy person, this may already be enabled
	- A few new options and details about your current extensions should appear on the page (Load Unpacked, Pack Extension, Update)
8) Click **[Load Unpacked]** on the chrome://extensions/ page
	- A small window similar to file explorer, titled "Browse For Folder" will appear
9) Navigate *into* CYSCE-master and **select the folder named `Extension`**
10) Click the **[OK]** button.
11) **You're Done!**
	- Visit http://chooseyourstory.com/ and enjoy the extension features!

### Features list

+ Complete overhaul of storygame search functionality
+ Things you wish were clicky links are now clicky
+ Site navigation links are available from every webpage
+ Able to collapse and anchor thread posts
+ New profile settings
	+ Storygame Developer Mode
		- Allows for in-preview variable editing and other cool stuff
		- Hover over the page title to view the page ID; hover over a link to view its link ID
	+ CYS theme integration (no more need for stylish/stylus chrome extension)
		- Makes the site beautiful. Dark Mode for easy browsing at night, light mode for an elegant new look with the same comfy feel, or just keep the default :)
	+ Choose to recieve alerts or not
+ Text editors around the site now have syntax highlighting
	- toggleable for those who like the old way
+ Lots of nit-picky things we noticed and fixed
+ Complete graphic overhaul
	- New icons, symbols, and trophy graphics

### TODO

- [ ] Fix Var/Item Restriction buttons
	- Unknown cause.
- [ ] CSS -> SASS
	- [ ] Consolidate all stray CSS into either `_cyslantia-base.sass` or `notheme.css`
	- [ ] Convert all color literals in `_cyslantia-base.sass` to variables
	- [ ] Custom CodeMirror theme?
	- Graphical nit-picks
		- [ ] Forum Search Style
		- [ ] use FWW icons in themes/images/custom
		- [x] .smallerText {font-size: xx-small;} -> x-small
		- [ ] h3 font-size on /my/ and /help/articles -> x-small
		- [x] Dark theme equivalent for all-comments and ratings
		- [x] td containing nbsp; on /help/AboutUs -> display: none;
		- [ ] make RPS, RPS25, and Toggle graphics
		- [ ] fix first tr on /my/points
- [ ] Additional storygame search options
- [ ] Pimp out /my/
	- [ ] Visual consistency

- [ ] Publish CYSCE to Chrome Web-Store
