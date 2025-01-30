# [Tidal Neptune](https://github.com/Inrixia/neptunectl/releases/tag/latest) Plugins

This is a repository containing plugins I have made for the [Tidal Neptune Client](https://github.com/Inrixia/neptunectl/releases/tag/latest).

Want to chat, ask questions or hang out? Join the discord! **[discord.gg/jK3uHrJGx4](https://discord.gg/jK3uHrJGx4)**

If you like the project, and want to support me can to throw some bits at my [Sponsor Page](https://github.com/sponsors/Inrixia) ❤️

To install any of these plugins you need to have the [Tidal Neptune Client](https://github.com/Inrixia/neptunectl/releases/tag/latest) installed.

Then just paste the **Install Url** into the plugins page and hit enter.

![image](https://github.com/Inrixia/neptune-plugins/assets/6373693/a997156c-a281-46ec-992a-397a742dd146)

## My Public Plugins

You can see a list of all plugins including **unreleased** ones under the [**plugins directory**](https://github.com/Inrixia/neptune-plugins/tree/master/plugins)

- [TidalTags](#Tidal-Tags)
- [DiscordRPC](#DiscordRPC)
- [Last.fm](#Last.fm)
- [ListenBrainz](#ListenBrainz)
- [RealMAX](#RealMAX)
- [VolumeScroll](#Volume-Scroll)
- [CoverTheme](#Cover-Theme)
- [NativeFullscreen](#Native-Fullscreen)
- [Themer](#Themer)
- [Always Exclusive](#Always-Exclusive)
- [Shazam Files](#Shazam-Files)
- [NoBuffer](#NoBuffer)
- [Small Window](#Small-Window)
- [Downloader](#Downloader)

## Other Plugin Repositories

- **[twnlink/neptune-plugins](https://github.com/twnlink/neptune-plugins)**

## Contributing

Contributing is super simple and really appreciated!

1. Ensure you have **node** and **pnpm** installed.  
   Install NVM (https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating)

```bash
nvm install latest
nvm use latest
npm i -g pnpm
```

2. Clone the repo

```bash
git clone github.com/Inrixia/neptune-plugins
cd neptune-plugins
```

3. Install the packages

```bash
pnpm i
```

4. Start dev environment

```bash
pnpm run watch
```

5. Install dev plugins  
   You can now install dev plugins in Neptune with the url `http://localhost:3000/PluginName`  
   Changes will automatically rebuild so all you need to do is hit refresh in the Neptune plugins menu.

# Plugins

## Tidal Tags

Install Url:

```
https://inrixia.github.io/neptune-plugins/TidalTags
```

Adds

- **Track Quality Tags** next to song titles
- **Sample Rate/Bit Depth/Bitrate** information for currently playing track in the bottom right.
- **Sample Rate/Bit Depth/Bitrate** information for previously played tracks in library.

![image](https://github.com/Inrixia/neptune-plugins/assets/6373693/3883d3f5-c340-4653-beda-ac5971237ee3)
![image](https://github.com/Inrixia/neptune-plugins/assets/6373693/2b30406c-d2e0-4268-92f2-5ae4cc3262af)

## DiscordRPC

Install Url:

```
https://inrixia.github.io/neptune-plugins/DiscordRPC
```

Exactly what you think! Show off what you are listening to in your Discord status.

![image](https://github.com/Inrixia/neptune-plugins/assets/6373693/5dc644a5-1645-4344-b925-09ee2062f8b2)

## Last.fm

Install Url:

```
https://inrixia.github.io/neptune-plugins/LastFM
```

Scrobbles and sets currently playing for [**last.fm**](https://www.last.fm/).
Tidals default last.fm implementation can be very inaccurate, this tries to fix that with a focus on accuracy.

![image](https://github.com/Inrixia/neptune-plugins/assets/6373693/7e4ff7ad-422f-4836-b187-45217c5dd4e3)

## ListenBrainz

Install Url:

```
https://inrixia.github.io/neptune-plugins/ListenBrainz
```

Scrobbles and sets currently playing for [**ListenBrainz**](https://listenbrainz.org/).

![image](https://github.com/user-attachments/assets/2832d750-069a-461c-8500-72263a6bb5ca)

## RealMAX

Install Url:

```
https://inrixia.github.io/neptune-plugins/RealMAX
```

Tidal oftern has multiple versions of the same song at different qualities.
With RealMAX when playing a song if there is a version available at a higher quality it will automatically be added as the next song in the queue and skipped to.
This ensures you are **always listening to the best quality of a song**

## Volume Scroll

Install Url:

```
https://inrixia.github.io/neptune-plugins/VolumeScroll
```

Lets you scroll on the volume icon to change the volume by 10%. Can configure the step size, including different amounts for when you hold <kbd>SHIFT</kbd>.

![image](https://github.com/user-attachments/assets/3a795666-2ed3-4feb-8d42-9374d4f6edd3)

## Cover Theme

Install Url:

```
https://inrixia.github.io/neptune-plugins/CoverTheme
```

Theme Tidal based on the current playing songs cover art. Also adds CSS variables for the cover art to be used in custom themes.

![image](https://github.com/user-attachments/assets/cd1cd715-3032-4786-bf57-f6f6c21c0f23)

## Native Fullscreen

Install Url:

```
https://inrixia.github.io/neptune-plugins/NativeFullscreen
```

Add F11 hotkey for fullscreen to either make the normal UI fullscreen or tidal native fullscreen in a window!
![image](https://github.com/user-attachments/assets/91619318-fd1b-4c43-93fc-fc905630197b)

## Themer

Install Url:

```
https://inrixia.github.io/neptune-plugins/Themer
```

Create your own theme with a built-in CSS editor, powered by [Monaco Editor](https://microsoft.github.io/monaco-editor/). Press <kbd>CTRL</kbd> + <kbd>E</kbd> to open the editor, or go to Themer's plugin settings.

![image](https://github.com/user-attachments/assets/905dc5d9-a694-4729-9d18-b5064bccb879)

## Always Exclusive

Install Url:

```
https://inrixia.github.io/neptune-plugins/AlwaysExclusive
```

While enabled will ensure that audio output is set to exclusive mode

![image](https://github.com/Inrixia/neptune-plugins/assets/6373693/32ff8e55-728c-4a77-9e9e-50b53e90541c)

## Shazam Files

Install Url:

```
https://inrixia.github.io/neptune-plugins/Shazam
```

When enabled any files you drag onto your client will be run through [**Shazam**](https://www.shazam.com/) and added to the current playlist!

![image](https://github.com/Inrixia/neptune-plugins/assets/6373693/f637d5a0-fea0-4ba4-984e-ccddb81341b9)

## NoBuffer

Install Url:

```
https://inrixia.github.io/neptune-plugins/NoBuffer
```

Kicks the Tidal cdn if the current playback stalls to make it stop so you never have to deal with constant stuttering or stalling again!

![image](https://github.com/Inrixia/neptune-plugins/assets/6373693/8378a9a3-2d3f-4cd7-af04-ceeac350b9e6)

## Small Window

Install Url:

```
https://inrixia.github.io/neptune-plugins/SmallWindow
```

Removes the minimum width and height limits on the window. Causes some UI bugs but can be useful if you want a smaller window.

![image](https://github.com/user-attachments/assets/cb1eb26f-fb12-480e-99b2-76f9da5787f4)

## Downloader

Install Url:

```
https://inrixia.github.io/neptune-plugins/SongDownloader
```

Adds a Download button to **Songs**, **Playlists** & **Albums** context menus.
Supports selecting multiple songs.

![image](https://github.com/Inrixia/neptune-plugins/assets/6373693/4811bf7d-3377-4a9a-b33f-ae0dddd394cb)

Embeds full metadata including Lyrics & AlbumArtwork!

```
General
Complete name          : Pink Floyd - Wish You Were Here - Shine On You Crazy Diamond (Pts. 1-5).flac
Format                 : FLAC
Format/Info            : Free Lossless Audio Codec
File size              : 525 MiB
Duration               : 13 min 32 s
Overall bit rate mode  : Variable
Overall bit rate       : 5 416 kb/s
Album                  : Wish You Were Here
Album/Performer        : Pink Floyd
Track name             : Shine On You Crazy Diamond (Pts. 1-5)
Track name/Position    : 1
Track name/Total       : 5
Performer              : Pink Floyd
Recorded date          : 1975-09-15
ISRC                   : GBN9Y1100085
Copyright              : (P) 2016 The copyright in this sound recording is owned by Pink Floyd Music Ltd., marketed and distributed by Sony Music Entertainment
Cover                  : Yes
Cover type             : Cover (front)
Cover MIME             : image/jpeg
Lyrics                 : Remember when you were young? (Ha-ha-ha-ha) / You shone like the sun /  / Shine on, you crazy diamond /  / Now there's a look in your eyes / Like black holes in the sky /  / Shine on, you crazy diamond /  / You were caught in the crossfire / Of childhood and stardom / Blown on the steel breeze / Come on, you target for faraway laughter / Come on, you stranger / You legend, you martyr, and shine /  / You reached for the secret too soon / You cried for the moon /  / Shine on, you crazy diamond /  / Threatened by shadows at night / And exposed in the light /  / Shine on, you crazy diamond /  / Well, you wore out your welcome / With random precision / Rode on the steel breeze / Come on, you raver, you seer of visions / Come on, you painter / You piper, you prisoner, and shine
Comment                : http://www.tidal.com/track/55391798

Audio
Format                 : FLAC
Format/Info            : Free Lossless Audio Codec
Duration               : 13 min 32 s
Bit rate mode          : Variable
Bit rate               : 5 414 kb/s
Channel(s)             : 2 channels
Channel layout         : L R
Sampling rate          : 192 kHz
Bit depth              : 24 bits
Compression mode       : Lossless
Replay gain            : -2.90 dB
Replay gain peak       : 0.710358
Stream size            : 525 MiB (100%)
MD5 of the unencoded content: 1401A5C520F16BADDEA6670EFF08200B
```

**Filename format** values use tags. Available values you can use are found here: https://github.com/Inrixia/neptune-plugins/blob/0ca5ba60306fa293b767ec3736a43dd381c19c80/plugins/_lib/makeTags.ts#L68-L87
