# BandNames

BandNames is a Chrome extension that targets sites like Discord where changing your username frequently is a natural habit.

When arriving at a site you've determine worthy of your creative genius, this extension can be clicked to view a randomly selected band name that will surely get you a lot of attention one way or another.

You can easily copy this name to your clipboard by clicking the button on the popup or close the promp and reopen it for a different name.

## How to enable this extension (not yet available on the chrome store, if ever)

You can get a copy of all the files in this extension by cloning this repository to the desired location with `git clone https://github.com/ElijahMSmith/BandNames`

After cloning the files, go to the chrome extensions manager page by either putting "chrome://extensions" in the url bar or click the three dots in the upper right corner of the window, hover over more tools, then click extensions.

Turn "Developer Mode" on with the switch in the upper right hand corner.

Next, select "Load unpacked" (which just means the files haven't been compacted down to a single chrome executable yet) from the upper left corner of the screen, navigate to and select the folder containing all the cloned files, then click open.

The extension will now be loaded onto your chrome browser. It is designed to sync with any other browsers that sync to your Google account, so you shouldn't have to do anything if you go to a different device.

## You can update which urls you want this extension to be enabled through the extensions manager.

Navigate to the extensions manager page (follow instructions under the previous header).

From there, click the "details" option for this extension and scroll down to "Extension options."

Use this page to input addition URLs you want this extension to open on. You can also clear this list of URLs and start over. Any action you make on this page is stored away immediately, so don't worry about losing changes made if you close the page!

Note: URL comparisons when deciding to open the popup or not evaluate if the input value you save appears anywhere in the url, opening the popup if so. There is no need to include routes on the page, unless you only want to open the popup at certain places on the desired site.

## Recent Changes

-   Migrated to TypeScript for easier development.
-   Simplified the popups (in new window when opening an added URL and in the popup from clicking the icon) into one HTML page
-   Added a view to generate random band names from an extensive list of nouns and adjectives. Elements from each view hide if they are exclusive to that view and another is loaded.
-   Added the ability to switch the popup between several different views/modes: pre-generated names, random names, and custom names (to be added later and currently disabled).
-   Popup now opens to the mode you last used rather than the pre-generated names like it used to.

### Future Changes

-   Allow for custom names to be added and export your current list of names
