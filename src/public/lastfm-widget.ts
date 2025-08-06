interface Config {
    username: string;
}

let config: Config = {
    username: "xiechu"
}

// Helper function for getting by ID so TypeScript doesn't whine
function getById(id: string) {
    const ret = document.getElementById(id);

    if (!ret)
        throw new Error(`cannot find #${id}`);
    else
        return ret;
}

interface ActivityData {
    "album-art": string;
    "album-artist": string;
    "album-name": string;
}

function populate(data: ActivityData) {
    for (const [k, v] of Object.entries(data)) {
        const el = getById(k);

        if (k === "album-art")
            (el as HTMLImageElement).src = v;
        else
            el.textContent = v;
    }
}

function testPopulate() {
    populate({
        "album-art": "https://lastfm.freetls.fastly.net/i/u/770x0/c8affb5692bb0df0db21cf294fed5153.jpg#c8affb5692bb0df0db21cf294fed5153",
        "album-artist": "HALCALI",
        "album-name": "ハルカリベーコン",
    });
}

/*

The API endpoint for requesting this kind of information
requires you to provide an API key, which obviously can't
be hardcoded into this, so unfortunately this won't work
for static hosting sites like Neocities/Nekoweb - the way
I've handled it here is by adding an endpoint to server.ts
which acts as a wrapper around the last.fm API call, so
this is mostly just a proof of concept.

*/

interface Track {
    image: Array<Record<string, string>>;
    artist: Record<string, string>;
    album: Record<string, string>;
}

async function getActivity(): Promise<Track> {
    const res = await fetch(`/api/gettracks?user=${config.username}`)
        .then(r => r.json());

    return res.recenttracks.track[0];
}

(async () => {
    const track = await getActivity();

    const activity = {
        "album-art": track.image.slice(-1)[0]["#text"], // last image in array is the largest
        "album-artist": track.artist["#text"],
        "album-name": track.album["#text"],
    };
    
    const artistMBID = track.artist.mbid;
    const releaseMBID = track.album.mbid;

    if (artistMBID !== "") {
        const el = getById("album-artist");
        el.style.cursor = "pointer";
        el.title = "Opens a link";
        
        el.addEventListener("click", () => {
            window.open(`https://musicbrainz.org/artist/${artistMBID}`, "_blank");
        });
    }

    if (releaseMBID !== "") {
        const el = getById("album-name");
        el.style.cursor = "pointer";
        el.title = "Opens a link";
        
        el.addEventListener("click", () => {
            window.open(`https://musicbrainz.org/release/${releaseMBID}`, "_blank");
        });
    }

    if (!activity) throw new Error("could not get currently playing track");

    populate(activity);
})();