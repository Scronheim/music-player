<template>
  <v-app>
    <v-navigation-drawer
        v-model="drawer"
        :clipped="$vuetify.breakpoint.lgAndUp"
        app
    >
      <v-list dense>
        <template v-for="item in menu">
          <v-row
              v-if="item.heading"
              :key="item.heading"
              align="center"
          >
            <v-col cols="6">
              <v-subheader v-if="item.heading">
                {{ item.heading }}
              </v-subheader>
            </v-col>
            <v-col
                cols="6"
                class="text-center"
            >
              <a
                  href="#!"
                  class="body-2 black--text"
              >EDIT</a>
            </v-col>
          </v-row>
          <v-list-group
              v-else-if="item.children"
              :key="item.text"
              v-model="item.model"
              :prepend-icon="item.model ? item.icon : item['icon-alt']"
              append-icon=""
          >
            <template v-slot:activator>
              <v-list-item-content>
                <v-list-item-title>
                  {{ item.text }}
                </v-list-item-title>
              </v-list-item-content>
            </template>
            <v-list-item
                v-for="(child, i) in item.children"
                :key="i"
                link
            >
              <v-list-item-action v-if="child.icon">
                <v-icon>{{ child.icon }}</v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>
                  {{ child.text }}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-group>
          <v-list-item
              v-else
              :key="item.text"
              link
          >
            <v-list-item-action>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>
                {{ item.text }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>
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
    <v-content>
      <v-list>
        <v-list-group v-for="artist in filteredArtists" v-bind:key="artist._id">
          <template v-slot:activator>
            <v-list-item-title>{{ artist.artist }}</v-list-item-title>
          </template>

          <v-list-group v-for="(album, index) in artist.albums" v-bind:key="album.title"
                        no-action
                        sub-group
                        value="false"
          >
            <template v-slot:activator>
              <v-list-item-content>
                <v-list-item-title>[{{ album.year }}] {{ album.title }} ({{ album.genre }})</v-list-item-title>
              </v-list-item-content>
              <v-list-item-action>
                <v-btn icon @click.native.stop="editAlbum(artist, index)">
                  <v-icon color="grey lighten-1">mdi-pencil</v-icon>
                </v-btn>
              </v-list-item-action>
            </template>

            <v-list-item
                v-for="(track, i) in album.tracks"
                :key="i"
                link
                @dblclick="switchTrack(track, album, artist)"
            >
              <v-list-item-title v-text="track.title"></v-list-item-title>
            </v-list-item>
          </v-list-group>
        </v-list-group>
      </v-list>
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
              <v-list-item-title class="headline mb-1">{{ fullTrackInfo.track.title }}</v-list-item-title>
              <v-list-item-subtitle>{{ fullTrackInfo.artist.artist }}</v-list-item-subtitle>
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
              <v-col cols="2">
                <v-btn v-if="isPlaying" @click="player.pause()">Pause</v-btn>
                <v-btn v-else @click="player.play()">Play</v-btn>
                <v-btn @click="nextTrack">Next</v-btn>
              </v-col>
              <v-col>
                <div class="volbox">
                  Volume:<br/>
                  <input id="volume" type="range" min="0" max="1" value="1" step="0.1" @input="setVolume">
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-footer>
      <v-dialog
          v-model="editDialog"
          max-width="500"
          eager
      >
        <v-card>
          <v-card-title class="headline">Edit album</v-card-title>

          <v-card-text>
            <v-text-field label="Title" v-model="editableArtist.albums[editableIndex].title"></v-text-field>
            <v-select v-model="editableArtist.albums[editableIndex].year"
                      :items="yearsList"
                      label="Year"
            ></v-select>
            <v-text-field label="Genre" v-model="editableArtist.albums[editableIndex].genre"></v-text-field>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>

            <v-btn
                color="red darken-1"
                text
                @click="editDialog = false"
            >
              Cancel
            </v-btn>

            <v-btn
                color="green darken-1"
                text
                @click="saveAlbum"
            >Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-content>
  </v-app>
</template>

<script>
  import WaveSurfer from 'wavesurfer.js';
  import axios from 'axios';
  import _ from 'lodash';

  const API_URL = 'http://localhost:8081';
  const FILE_URL = 'http://127.0.0.1:8887';
  export default {
    name: 'App',
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
      this.player.on('error', function(e) {
        console.warn(e)
      });
      this.getAllTracks();
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
        return this.all.filter(
            function (o) {
              return ((self.filter === '')
                  || (o.artist.toUpperCase().indexOf(self.filter.toUpperCase()) >= 0)
              )
            }
        )
      },
      currentTrack() {
        if (this.fullTrackInfo.artist.artist !== undefined) {
          return `${this.fullTrackInfo.artist.artist} - ${this.fullTrackInfo.track.title} (${this.fullTrackInfo.album.title}) [${this.fullTrackInfo.album.year}]`;
        }
        return '';
      }
    },
    watch: {
      'fullTrackInfo.track': function () {
        this.showAlert = true;
      }
    },
    data: () => ({
      open: [],
      yearsList: _.range(2020, 2000),
      tree: [],
      player: '',
      filter: '',
      dialog: false,
      drawer: false,
      showAlert: false,
      editDialog: false,
      menu: [
        { icon: 'mdi-contacts', text: 'Contacts' },
      ],
      fullTrackInfo: {
        artist: {},
        album: {},
        track: {}
      },
      all: [],
      editableArtist: {albums: [{
          title: '',
          year: ''
        }]},
      editableIndex: 0
    }),
    methods: {
      getAllTracks() {
        axios.get(`${API_URL}/all`).then((response) => {
          this.all = response.data.data;
        })
      },
      switchTrack(track, album, artist) {
        this.fullTrackInfo.artist = artist;
        this.fullTrackInfo.album = album;
        this.fullTrackInfo.track = track;
        if (this.fullTrackInfo.artist.artist === artist.artist && this.fullTrackInfo.track.title === track.title && this.player.isPlaying()) {
          this.player.playPause();
        } else {
          this.player.load(`${FILE_URL}/${encodeURI(track.filepath)}`);
        }
      },
      setVolume(event) {
        this.player.setVolume(event.target.value);
      },
      nextTrack() {
        let nextTrack = _.find(this.fullTrackInfo.album.tracks, ['number', this.fullTrackInfo.track.number+1]);
        if (nextTrack !== undefined) {
          this.fullTrackInfo.track = nextTrack;
          this.player.load(`${FILE_URL}/${encodeURI(nextTrack.filepath)}`)
        }
      },
      editAlbum(artist, index) {
        this.editableArtist = _.cloneDeep(artist);
        this.editableIndex = index;
        this.editDialog = true;
      },
      saveAlbum() {
        axios.patch(`${API_URL}/saveAlbum`, this.editableArtist).then((response) => {
          if (response.data.data.ok === 1) {
            this.editDialog = false;
            this.getAllTracks();
          }
        })
      }
    },
  };
</script>
