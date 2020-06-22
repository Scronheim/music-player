<template>
  <v-app>
    <v-navigation-drawer
        v-model="drawer"
        :clipped="$vuetify.breakpoint.lgAndUp"
        app
    >
      <v-list dense>
        <v-list-item @click="uploadDialog = true; drawer = false" link>
          <v-list-item-icon>
            <v-icon>mdi-plus</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>Add new</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item @click="activePage = 1; drawer = false" link>
          <v-list-item-icon>
            <v-icon>mdi-home</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>Home</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item @click="showLiked" link>
          <v-list-item-icon>
            <v-icon>mdi-thumb-up</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>Liked</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar
        fixed
        :clipped-left="$vuetify.breakpoint.lgAndUp"
        app
    >
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title
          style="width: 150px"
          class="ml-0 pl-4"
      >
        <span class="hidden-sm-and-down">Music Library</span>
      </v-toolbar-title>
      <v-text-field
          flat
          solo-inverted
          hide-details
          prepend-inner-icon="mdi-magnify"
          label="Search"
          class="hidden-sm-and-down"
          v-model="filter"
      ></v-text-field>
    </v-app-bar>
    <v-main style="padding-bottom: 115px">
      <v-list v-if="activePage === 1">
        <v-list-group v-for="(artist, index) in filteredArtists" v-bind:key="artist._id">
          <template v-slot:activator>
            <v-list-item-title>{{ artist.artist }}</v-list-item-title>
            <v-list-item-action>
              <v-btn icon @click.native.stop="editData(artist, index)">
                <v-icon color="grey lighten-1">mdi-pencil</v-icon>
              </v-btn>
            </v-list-item-action>
          </template>
          <v-list-item class="pl-14" v-for="(album) in artist.albums" :key="album.title" link @click="showAlbum(artist, album)">
            <v-list-item-title v-text="`${album.title} (${album.year}) (${album.genre})`"></v-list-item-title>
          </v-list-item>
        </v-list-group>
      </v-list>
      <v-row v-else-if="activePage === 2" style="padding-left: 5px">
        <v-col v-for="track in filteredArtists" v-bind:key="track._id">
          <liked-tracks @play="switchTrack" @deleteLike="deleteLike" :track="track"></liked-tracks>
        </v-col>
      </v-row>
      <TracksInAlbum v-else-if="activePage === 3" :album="currentAlbum" :artist="currentArtist"></TracksInAlbum>
      <v-snackbar
          right
          top
          v-model="showAlert">
        <v-card
            class="mx-auto"
            width="300"
            outlined
        >
          <v-list-item three-line>
            <v-list-item-content>
              <div class="overline mb-4">Current track</div>
              <v-list-item-title class="headline mb-1">{{ currentTrackInfo.track }}</v-list-item-title>
              <v-list-item-subtitle>{{ currentTrackInfo.artist }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-card>
      </v-snackbar>
      <v-footer fixed :padless="true">
        <v-card
            flat
            tile
            width="100%"
            class="darken-1"
        >
          <hr/>
          <v-card-text>
            <div id="waveform"></div>
            <v-row>
              <v-col cols="3">
                <v-btn @click="previousTrack"><v-icon>mdi-skip-previous</v-icon></v-btn>
                <v-btn v-if="isPlaying" @click="player.pause()"><v-icon>mdi-pause</v-icon></v-btn>
                <v-btn v-else @click="player.play()"><v-icon>mdi-play</v-icon></v-btn>
                <v-btn @click="nextTrack"><v-icon>mdi-skip-next</v-icon></v-btn>
                <v-btn @click="shuffle = !shuffle">
                  <v-icon v-if="shuffle" color="orange darken-2">mdi-shuffle</v-icon>
                  <v-icon v-else>mdi-shuffle</v-icon>
                </v-btn>
              </v-col>
              <v-col cols="2">
                <div class="volbox">
                  Volume:<br/>
                  <input id="volume" type="range" min="0" max="1" value="1" step="0.1" @input="setVolume">
                </div>
              </v-col>
              <v-col v-if="currentTrack !== ''">
                Current track: <b>{{ currentTrack }}</b>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-footer>
      <v-dialog v-model="editDialog" max-width="500" eager>
        <v-card>
          <v-card-title class="headline">Edit data</v-card-title>
          <v-card-text>
            <v-text-field label="Artist title" v-model="editableArtist.artist"></v-text-field>
            <v-select :items="countries" label="Country" v-model="editableArtist.country"></v-select>
            <v-text-field label="MBID" v-model="editableArtist.mbid"></v-text-field>
            <v-select id="selectedAlbum" :items="editableArtist.albums" label="Albums" item-text="title" item-value="index"
                      return-object v-model="selectedAlbum"></v-select>
            <template v-if="selectedAlbum.title !== undefined">
              <v-select label="Year" :items="yearsList" v-model="selectedAlbum.year"></v-select>
              <v-text-field label="Genre" v-model="selectedAlbum.genre"></v-text-field>
              <v-text-field label="MBID" v-model="selectedAlbum.mbid"></v-text-field>
              <v-text-field label="Cover" v-model="selectedAlbum.cover" :append-icon="selectedAlbum.mbid ? 'mdi-download': ''"
                            @click:append="getCover"></v-text-field>
              <v-text-field v-for="track in selectedAlbum.tracks" v-bind:key="track.title" v-model="track.title"></v-text-field>
            </template>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>

            <v-btn
                color="red darken-1"
                text
                @click="editDialog = false; selectedAlbum = {}"
            >
              Cancel
            </v-btn>

            <v-btn
                color="green darken-1"
                text
                @click="saveData"
            >Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog v-model="uploadDialog" max-width="550" eager>
        <v-card>
          <v-card-title class="headline">Add Data</v-card-title>
          <v-card-text>
            <v-textarea
                label="Put JSON here"
                v-model="jsonForInsert"
            ></v-textarea>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>

            <v-btn
                color="red darken-1"
                text
                @click="uploadDialog = false"
            >
              Cancel
            </v-btn>

            <v-btn
                color="green darken-1"
                text
                @click="addData"
            >Upload</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-main>
  </v-app>
</template>

<script>
  import WaveSurfer from 'wavesurfer.js';
  import axios from 'axios';
  import _ from 'lodash';
  import LikedTracks from "./components/LikedTracks";
  import TracksInAlbum from "./components/TracksInAlbum";

  const API_URL = 'http://localhost:8081';
  const FILE_URL = 'http://127.0.0.1:8887';
  const COVER_ART_URL = 'https://coverartarchive.org/release';
  export default {
    name: 'App',
    components: {LikedTracks, TracksInAlbum},
    mounted () {
      this.$vuetify.theme.dark = true;
      this.player = WaveSurfer.create({
        container: '#waveform',
        waveColor: 'violet',
        progressColor: 'purple',
        height: 20
      });
      this.player.on('ready', () => {
        this.player.play();
      });
      this.player.on('finish', () => {
        this.nextTrack();
      });
      this.player.on('error', function(e) {
        console.warn(e)
      });
      this.getAllTracks();
      this.getLiked();
    },
    computed: {
      isPlaying () {
        if (this.player !== '') {
          return this.player.isPlaying()
        }
        return false;
      },
      filteredArtists: function () {
        let self = this;
        if (this.activePage === 2) {
          return this.likedTracks.filter(
              function (o) {
                return ((self.filter === '')
                    || (o.artist.toUpperCase().indexOf(self.filter.toUpperCase()) >= 0)
                    || (o.album.toUpperCase().indexOf(self.filter.toUpperCase()) >= 0)
                    || (o.title.toUpperCase().indexOf(self.filter.toUpperCase()) >= 0)
                )
              }
          )
        } else if (this.activePage === 1) {
          return this.all.filter(
              function (o) {
                return ((self.filter === '')
                    || (o.artist.toUpperCase().indexOf(self.filter.toUpperCase()) >= 0)
                )
              }
          )
        } else {
          return false;
        }
      },
      currentTrack() {
        if (this.currentTrackInfo.artist !== '') {
          return `${this.currentTrackInfo.artist} - ${this.currentTrackInfo.track}`;
        }
        return '';
      },
    },
    watch: {
      'currentTrackInfo.track': function () {
        this.showAlert = true;
      }
    },
    data: () => ({
      yearsList: _.range(2020, 2000),
      player: '',
      filter: '',
      drawer: false,
      showAlert: false,
      editDialog: false,
      uploadDialog: false,
      countries: ['Russia', 'Germany', 'USA', 'Spain', 'Israel'],
      currentTrackInfo: {
        artist: '',
        album: '',
        track: ''
      },
      currentArtist: {},
      currentAlbum: {},
      fullTrackInfo: {
        artist: {},
        album: {},
        track: {}
      },
      all: [],
      likedTracks: [],
      activePage: 1, // 1-main, 2-liked, 3-tracks in album
      editableArtist: {albums: [{
          title: '',
          year: ''
        }]},
      shuffle: false,
      selectedAlbum: '',
      jsonForInsert: '',
      zipFile: []
    }),
    methods: {
      getAllTracks() {
        axios.get(`${API_URL}/all`).then((response) => {
          this.all = response.data.data;
        })
      },
      switchTrack(track, album, artist) {
        if (track.year === undefined) {
          this.currentTrackInfo.artist = artist.artist;
          this.currentTrackInfo.album = album.title;
          this.currentTrackInfo.track = track.title;
          this.currentTrackInfo.year = album.year;
          this.currentTrackInfo.cover = album.cover;
        } else {
          artist = _.find(this.all, {albums: [{tracks: [{filepath: track.filepath}]}]});
          this.currentTrackInfo.artist = track.artist;
          this.currentTrackInfo.album = track.album;
          this.currentTrackInfo.track = track.title;
          this.currentTrackInfo.year = track.year;
          this.currentTrackInfo.cover = track.cover;
        }
        track.playCounts += 1;
        this.saveData(artist);
        this.player.load(`${FILE_URL}/${encodeURI(track.filepath)}`);
      },
      setVolume(event) {
        this.player.setVolume(event.target.value);
      },
      nextTrack() {
        let nextTrack;
        if (this.shuffle) {
          nextTrack = this.getRandomTrack();
        } else {
          nextTrack = _.find(this.fullTrackInfo.album.tracks, ['number', this.fullTrackInfo.track.number + 1]);
          this.fullTrackInfo.track = nextTrack;
        }
        if (nextTrack !== undefined) {
          this.player.load(`${FILE_URL}/${encodeURI(nextTrack.filepath)}`);
        }
      },
      getRandomTrack() {
        let randomArtistIndex = _.random(0, this.all.length-1);
        this.fullTrackInfo.artist = this.all[randomArtistIndex];
        let randomAlbumIndex = _.random(0, this.all[randomArtistIndex].albums.length-1);
        this.fullTrackInfo.album = this.all[randomArtistIndex].albums[randomAlbumIndex];
        let randomTrackIndex = _.random(0, this.all[randomArtistIndex].albums[randomAlbumIndex].tracks.length-1);
        this.fullTrackInfo.track = this.all[randomArtistIndex].albums[randomAlbumIndex].tracks[randomTrackIndex];
        return this.all[randomArtistIndex].albums[randomAlbumIndex].tracks[randomTrackIndex];
      },
      previousTrack() {
        let prevTrack;
        if (this.shuffle) {
          prevTrack = this.getRandomTrack();
        } else {
          prevTrack = _.find(this.fullTrackInfo.album.tracks, ['number', this.fullTrackInfo.track.number - 1]);
          this.fullTrackInfo.track = prevTrack;
        }
        if (prevTrack !== undefined) {
          this.player.load(`${FILE_URL}/${encodeURI(prevTrack.filepath)}`)
        }
      },
      editData(artist) {
        this.editableArtist = _.cloneDeep(artist);
        this.selectedAlbum = {};
        this.editDialog = true;
      },
      saveData(artist) {
        // затычка для операции редактирования
        if (artist.type === 'click') {
          artist = this.editableArtist;
        }
        axios.patch(`${API_URL}/saveData`, artist).then((response) => {
          if (response.data.data.ok === 1) {
            this.editDialog = false;
            this.getAllTracks();
          }
        })
      },
      addData() {
        axios.post(`${API_URL}/addData`, JSON.parse(this.jsonForInsert)).then((response) => {
          if (response.data.data) {
            this.uploadDialog = false;
            this.getAllTracks();
          }
        })
      },
      getCover() {
        axios.get(`${COVER_ART_URL}/${this.selectedAlbum.mbid}`).then((response) => {
          if (response.status === 200) {
            this.selectedAlbum.cover = _.find(response.data.images, ['front', true]).thumbnails['250'];
          }
        })
      },
      likeTrack(artist, album, track) {
        track.liked = !track.liked;
        this.editableArtist = artist;
        this.saveData(artist);
        if (track.liked) {
          this.saveLike(artist, album, track);
        } else {
          let modTrack = _.clone(track);
          modTrack.artist = artist.artist;
          modTrack.album = album.title;
          this.deleteLike(modTrack);
        }
      },
      deleteLike(track) {
        axios.delete(`${API_URL}/liked/?file=${track.filepath}&artist=${track.artist}&album=${track.album}`).then(() => {
          this.getLiked();
        });
      },
      saveLike(artist, album, track) {
        let payload = {
          artist: artist.artist,
          album: album.title,
          title: track.title,
          year: album.year,
          number: track.number,
          filepath: track.filepath,
          cover: album.cover,
          genre: album.genre
        };
        axios.post(`${API_URL}/liked`, payload).then(() => {
          this.getLiked();
        });
      },
      getLiked() {
        axios.get(`${API_URL}/liked`).then((response) => {
          this.likedTracks = response.data.data;
        })
      },
      showLiked() {
        this.activePage = 2;
        this.drawer = false;
      },
      play(track) {
        this.fullTrackInfo.artist.artist = track.artist;
        this.fullTrackInfo.album.title = track.album;
        this.fullTrackInfo.album.year = track.year;
        this.fullTrackInfo.track.title = track.title;
        this.player.load(`${FILE_URL}/${encodeURI(track.filepath)}`);
      },
      showAlbum(artist, album) {
        this.currentAlbum = album;
        this.currentArtist = artist;
        this.activePage = 3;
      }
    },
  };
</script>
