<template>
  <v-row>
    <v-col cols="3">
      <v-card class="mx-auto">
        <v-img :src="album.cover">
          <template v-slot:placeholder>
            <v-row
              class="fill-height ma-0"
              align="center"
              justify="center"
            >
              <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
            </v-row>
          </template>
        </v-img>
      </v-card>
    </v-col>
    <v-col>
      Artist: {{ artist.artist }}<br/>
      Album: {{ album.title }}<br/>
      Year: {{ album.year }}<br/>
      Genre: {{ album.genre }}<br/>
      <v-list>
        <v-subheader>Tracks:</v-subheader>
        <v-list-item-group color="primary">
          <v-list-item
            v-for="(track, i) in album.tracks"
            :key="i"
          >
            <!--            <v-list-item-icon>-->
            <!--              <v-icon v-text="item.icon"></v-icon>-->
            <!--            </v-list-item-icon>-->
            <v-list-item-content>
              <v-list-item-title v-text="track.title"></v-list-item-title>
              <v-list-item-subtitle>Play counts: {{ track.playCounts }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-col>
  </v-row>
</template>

<script>
    export default {
        props: ['album', 'artist'],
        name: "TracksInAlbum",
        data: () => ({

        })
    }
</script>

<style scoped>

</style>
