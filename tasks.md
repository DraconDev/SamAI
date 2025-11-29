# Tasks

## Plan

- Simplify the search highlight
  - Its either favorite or hide
- we need better styling for the home tab
- make sure our bottom right corner toggle sidebar button is always above the icons, no matter what site is loaded, but obviously we want it behind the side panel when that is open, no fixed a site icon still covering it
- the page scraper doesn't follow the same tab style exactly as the rest of the app, we need to fix that, but otherwise looks good

## Do

- the drag does seem to work but 
  - when we drag around an icon others should shift around, we should see this visually, i mean others that are valid to move around like folder for folders, and icons for icons, so when i drag an page icon the other page icons should shift around to show where it will go, but folders should stay put, folders should i be able to drag into, and of course when i drag around folders the same happens, and folders cant be nested
  - emphasizing that currently you cant drag a link site icon into a folder icon, it is just reordering to the first position of the site icons, 
- the search bar is still not the same height, we need to fix that
- 



## Done

- folder icons have a weird background lets get rid of that, also if we can use a different folder icon that would be great
- make the icons more tightly packet much like a phone screen, 
  - this is pretty close but make icon even bigger
- also folder icons should be big too
  - folder icons should be much bigger like the images 
- No search bar where is it? We need it 
  - We can have Home - Search pane in the middle + Add in the corner 
- [x] the back to home button is in the rught place but we need to style it better, it could take up the whole space
  - this is almost perfect but i the button to take up the whole space, no rounded courses either, and make it more much cooler
  - make it have a much cooler icon and round corners
- + add button doesn't open anything right now 
- What if we didn't have those big add current and add site buttons and instead we had normal sized buttons in the icon grid, and one of the buttons was a plus always at the end to add select between adding current site, custom site, or custom folder
  - this would make the whole thing more compact and allow more icons to be visible at once
  - presumably this would also fix our drag and drop issue, cause here me our we can drag and drop issue cause lets say folders come first, then sites, then the add button is last, so whe we drag and drop a site to reorder between sites but when we hover over folder we add to the folder instead of reordering
  - same with folders, we can reorder between folders, but we cant put a folder into another folder, so drag and drop works perfectly here
  - also this would mean that we are getitng rid of the big buttons that take up so much space and make the whole thing look less professional 
- now we need to take out the plus button in the icon grid, now that we have one on the home tab header, that ideally shouldn't move up when hovered over, 
- [x] the home bg should be the same as the chat tab bg
- add current and add site butttons should be the same size
  - they are not currently
- add site button changes
  - site name first
  - site url second
  - then cancel button left side and add button right side
  - then icon url third
  - better styling for the whole thing
