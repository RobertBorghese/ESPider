
function GetGreenworksPath() {
    const path = require("path");
    const base = path.dirname(process.mainModule.filename);
    return path.join(base, "js/libs/greenworks-win64.node");
};

let SteamWorks = null;
function UnlockAchievement(id) {
    if(SteamWorks === false) return;
    let g = null;
    try {
        g = require(GetGreenworksPath());
        if(g.initAPI()) {
            console.log("Steam connected");
        } else {
            g = null;
            SteamWorks = false;
        }
    } catch(e) {
        console.error("Could not load greenworks?");
        console.error(e);
        g = null;
        SteamWorks = false;
    }
    if(g !== null) {
        SteamWorks = true;
        g.activateAchievement(id, function() {}, function(e) {
            console.error("Achivement error.");
            console.error(e);
        });
    }
}
