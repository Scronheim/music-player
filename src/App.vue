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
        :clipped-left="$vuetify.breakpoint.lgAndUp"
        app
    >
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title
          style="width: 300px"
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
      <div id="waveform"></div>
      <hr/>
      <v-btn v-if="isPlaying" @click="player.pause()">Pause</v-btn>
      <v-btn v-else @click="player.play()">Play</v-btn>
      <hr/>
      <v-list>
        <v-list-group v-for="group in all" v-bind:key="group._id">
          <template v-slot:activator>
            <v-list-item-title>{{ group.group }}</v-list-item-title>
          </template>

          <v-list-group v-for="album in group.albums" v-bind:key="album.title"
              no-action
              sub-group
              value="false"
          >
            <template v-slot:activator>
              <v-list-item-content>
                <v-list-item-title>{{ album.title }}</v-list-item-title>
              </v-list-item-content>
            </template>

            <v-list-item
                v-for="(track, i) in album.tracks"
                :key="i"
                link
            >
              <v-list-item-title v-text="track.title"></v-list-item-title>
            </v-list-item>
          </v-list-group>
        </v-list-group>
      </v-list>
    </v-content>
  </v-app>
</template>

<script>
  import WaveSurfer from 'wavesurfer.js';
  import axios from 'axios';
  const API_URL = 'http://localhost:8081';
  export default {
    name: 'App',
    mounted () {
      this.$vuetify.theme.dark = true;
      this.player = WaveSurfer.create({
        container: '#waveform',
        waveColor: 'violet',
        progressColor: 'purple'
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
      filteredTracks: function () {
        let self = this;
        return this.all.filter(
            function (o) {
              return ((self.filter === '')
                  || (o.track.toUpperCase().indexOf(self.filter.toUpperCase()) >= 0)
                  || (o.artist.toUpperCase().indexOf(self.filter.toUpperCase()) >= 0)
              )
            }
        )
      },
    },
    data: () => ({
      open: [],
      tree: [],
      player: '',
      filter: '',
      dialog: false,
      drawer: false,
      menu: [
        { icon: 'mdi-contacts', text: 'Contacts' },
      ],
      currentTrackId: '',
      all: []
    }),
    methods: {
      getAllTracks() {
        axios.get(`${API_URL}/all`).then((response) => {
          this.all = response.data.data;
        })
      },
      switchTrack(track) {
        this.currentTrackId = track._id;
        this.player.load(track.filepath);
      }
    },
  };
</script>
