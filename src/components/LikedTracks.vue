<template>
  <v-card
      class="mx-auto"
      max-width="500"
  >
    <v-container fluid>
      <v-row dense>
        <v-col>
          <v-card>
            <v-img
                :src="track.cover"
                class="white--text align-end"
                gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
                height="200px"
            >
              <template v-slot:placeholder>
                <v-row
                    class="fill-height ma-0"
                    align="center"
                    justify="center"
                >
                  <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
                </v-row>
              </template>
              <v-card-title v-text="`${track.artist} - ${track.title}`"></v-card-title>
            </v-img>

            <v-card-actions>
              {{ track.album }} ({{ track.year }})
              <v-spacer></v-spacer>
              <v-btn icon @click="$emit('play', track)">
                <v-icon>mdi-play</v-icon>
              </v-btn>
              <v-btn icon @click="$emit('deleteLike', track)">
                <v-icon>mdi-heart</v-icon>
              </v-btn>
              <v-btn icon>
                <v-icon>mdi-share-variant</v-icon>
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script>
  export default {
    props: ['track', 'player'],
    name: 'LikedTracks',
    data: () => ({

    }),
  }
</script>
