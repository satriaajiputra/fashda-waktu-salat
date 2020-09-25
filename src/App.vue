<template>
  <div id="app">
    <header-app></header-app>
    <div class="container">
      <section class="content">
        <h1 class="title">Pencarian Waktu Salat</h1>
        <div class="paragraph mb-10">
          <p>
            Cari waktu salat beserta masjid terdekat berdasarkan nama tempat atau kota
          </p>
        </div>
        <alert alert-type="info" class="my-4">
          <p>
            <strong>Waktu Saat Ini:</strong> {{currentTime}}
          </p>
        </alert>
        <div class="grid grid-cols-12 -mx-4 items-center">
          <div class="form-field col-span-9 px-4">
            <input type="text" ref="search" placeholder="Cari berdasarkan Nama Kota, Kecamatan, Desa, ...">
          </div>
          <div class="col-span-3 px-4">
            <button type="button" @click.prevent="startSearch" class="btn btn_primary btn_block">Cari Jadwal</button>
          </div>
        </div>
        <transition-group name="fade" mode="out-in">
          <div v-if="searching" key="loader" class="flex justify-center items-center flex-col mt-8">
            <img src="@/assets/loading.svg" width="80" />
            <p>Sedang mencari...</p>
          </div>
          <div class="tab mt-8" key="tab" v-if="prayTime && !searching">
            <div class="tab__nav">
              <a href="#waktu" @click.prevent="activeTab = 'waktu'" :class="{'tab__nav_active': activeTab === 'waktu'}">Waktu Salat</a>
              <a href="#masjid" @click.prevent="activeTab = 'masjid'" :class="{'tab__nav_active': activeTab === 'masjid'}">Masjid Terdekat</a>
            </div>
            <div class="tab__content">
              <transition-group name="fade" mode="in-out">
                <div v-if="activeTab === 'waktu'" key="waktu" class="tab__content__item">
                  <alert alert-type="success" class="mb-4">
                    <p>
                      <strong>{{nextPrayTime.text}}</strong> akan memasuki waktu <strong>{{nextPrayTime.time}}</strong>
                    </p>
                  </alert>
                  <div class="overflow-x-auto">
                    <table class="table w-full">
                      <thead>
                        <tr>
                          <th width="200">Waktu</th>
                          <th>Jam</th>
                        </tr>
                      </thead>
                      <tbody>
                        <template v-if="prayTime">
                          <tr v-for="(time, key) in prayTime.timings" :key="key">
                            <td>{{key}}</td>
                            <td>{{time}}</td>
                          </tr>
                        </template>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div v-else-if="activeTab === 'masjid'" key="masjid" class="tab__content__item">
                  <template v-if="mosque">
                    <div class="mosque" @click.prevent="showMap(key)" v-for="(item, key) in mosque" :key="key">
                      <div class="mosque__icon">
                        <img :src="item.icon" alt="icon">
                      </div>
                      <div class="mosque__detail">
                        <h2 class="title">{{item.name}}</h2>
                        <p>{{item.formatted_address}}</p>
                      </div>
                    </div>
                  </template>
                </div>
              </transition-group>
            </div>
          </div>
        </transition-group>
      </section>
      <about/>
      <footer-app></footer-app>
    </div>
    <transition name="fade" mode="out-in">
      <div v-show="modalActive" class="modal-wrapper" @click.prevent="modalActive = false">
        <div class="modal" @click.stop>
          <div class="modal__header">
            <h2 class="title">Peta Masjid Terdekat</h2>
            <button class="btn btn_danger font-bold" @click.prevent="modalActive = false">&times;</button>
          </div>
          <div class="modal__body">
            <div class="paragraph">
              <div v-if="modalMosque">
                <p>
                  <strong>Nama Masjid : </strong> {{modalMosque.name}}<br/>
                  <strong>Alamat Masjid :</strong> {{modalMosque.formatted_address}}
                </p>
                <a :href="`https://plus.codes/${modalMosque.plus_code.global_code}`" target="_blank" class="btn btn_primary mb-4">Lihat di Google Maps</a>
              </div>
            </div>
            <div id="map" class="map" ref="map"></div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import Alert from '@/components/Alert.vue'
import About from '@/components/About.vue'

// eslint-disable-next-line no-unused-vars
import Mosque from '@/api/mosque'
import PrayTime, { timeZone } from '@/api/pray-time'
import forEach from 'lodash/forEach'

import GoogleMapsApiLoader from 'google-maps-api-loader'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/id'

export default {
  name: 'App',
  components: {
    HeaderApp: Header,
    FooterApp: Footer,
    Alert,
    About
  },
  data () {
    return {
      googleApiKey: 'AIzaSyDGEQ50lLfARSJEVn0TKRsCXB3IPZt1CCc',
      activeTab: 'waktu',
      searching: false,
      searchBox: null,
      placeService: null,
      marker: null,
      prayTime: null,
      mosque: null,
      modalMosque: null,
      modalActive: false,
      google: null,
      map: null,
      lat: null,
      lng: null
    }
  },
  computed: {
    currentTime () {
      return dayjs().format('DD MMMM YYYY HH:mm:ss') + ` (${timeZone})`
    },
    position () {
      return {
        lat: this.lat,
        lng: this.lng
      }
    },
    nextPrayTime () {
      if (!this.prayTime) return
      dayjs.extend(duration)
      dayjs.extend(relativeTime)
      dayjs.locale('id')
      const currTime = dayjs()
      let nextTime = null

      forEach(this.prayTime.timings, (val, idx) => {
        if (!val) return false
        const data = val.split(':')
        const time = dayjs(currTime).set('hour', data[0]).set('minute', data[1])
        time.set('hour', data[0])
        time.set('minute', data[1])

        if (time.isAfter(currTime)) {
          nextTime = {
            text: time.fromNow(),
            time: idx
          }
          return false
        }
      })

      return nextTime
    }
  },
  methods: {
    intializeSearchBox () {
      this.searchBox = new this.google.maps.places.SearchBox(this.$refs.search)
    },
    initializeMap () {
      const mapContainer = this.$refs.map
      this.map = new this.google.maps.Map(mapContainer, {
        center: { lat: -34.397, lng: 150.644 },
        zoom: 16
      })
      this.placeService = new this.google.maps.places.PlacesService(this.map)
    },
    async fetchPrayTime () {
      this.searching = true
      try {
        const resp = await PrayTime(this.lat, this.lng)
        this.prayTime = resp.data
        this.searching = false
      } catch (error) {
        this.searching = false
      }
    },
    fetchMosque () {
      if (!this.lat && !this.lng) return false
      this.placeService.textSearch({
        location: this.position,
        radius: 1500,
        query: 'masjid',
        type: ['mosque'],
        rankby: this.google.maps.places.RankBy.DISTANCE
      }, (r) => { this.mosque = r })
    },
    startSearch (ev) {
      const places = this.searchBox.getPlaces()

      if (typeof places === 'undefined') return null

      if (places.length === 0) return null

      this.lat = places[0].geometry.location.lat()
      this.lng = places[0].geometry.location.lng()

      // set marker
      this.initMarker(places[0].formatted_address)

      this.map.setCenter(this.position)

      this.fetchPrayTime()
      this.fetchMosque()
    },
    initMarker (title) {
      this.marker = new this.google.maps.Marker({
        position: this.position,
        map: this.map,
        title
      })
    },
    moveMarker (lat, lng) {
      const pos = new this.google.maps.LatLng(lat, lng)
      this.marker.setTitle('')
      this.marker.setPosition(pos)
      this.map.setCenter(pos)
    },
    showMap (idx) {
      this.modalActive = true
      this.modalMosque = this.mosque[idx]
      const pos = this.mosque[idx].geometry.location
      this.moveMarker(pos.lat(), pos.lng())
    }
  },
  created () {
  },
  async mounted () {
    const googleMapApi = await GoogleMapsApiLoader({
      libraries: ['places'],
      apiKey: this.googleApiKey
    })
    this.google = googleMapApi
    this.initializeMap()
    this.intializeSearchBox()
  }
}
</script>

<style lang="scss">
  a {
    @apply text-primary;
  }

  #app {
    @apply text-standard;
  }
  .content {
    @apply bg-white rounded-xl -mt-32 p-8;
    box-shadow: 0px 7px 15px rgba(0, 0, 0, 0.15);
  }
  .title {
    @apply font-medium text-secondary text-2xl mb-3 leading-7;
  }
  h2.title {
    @apply text-xl font-semibold mb-2;
  }
  .paragraph {
    @apply leading-7;
    letter-spacing: 0.02rem;

    p {
      @apply mb-4;
    }
  }

  /* Form */
  .form-field {
    &, input {
      @apply w-full block;
    }
    input {
      @apply px-4 py-2 rounded-md border border-primaryLight outline-none transition-all duration-300;
      &:focus {
        @apply border-primary;
      }
    }
  }

  /* Button */
  .btn {
    @apply px-4 py-2 rounded-md bg-secondary text-white transition-all duration-300 font-medium inline-block;
    &,&:active,&:focus {
      @apply outline-none;
    }
    &:hover {
      opacity: 0.97;
    }
  }
  .btn_block {
    @apply block w-full;
  }
  .btn_primary {
    @apply bg-primary;
  }
  .btn_danger {
    @apply bg-red-600;
  }

  /* Mosque */
  .mosque {
    @apply flex items-center border border-gray-200 rounded-xl p-4 cursor-pointer mb-4;
    box-shadow: 0px 4px 7px rgba(0, 0, 0, 0.08);
  }
  .mosque__icon {
    @apply mr-4;

    img {
        width: 40px
    }
  }

  /* Tab */
  .tab__nav {
    @apply border-b border-primaryLight;

    a {
      @apply inline-block bg-primaryLight font-medium text-secondary px-8 py-2 rounded-tl-xl rounded-tr-xl mr-2;

      &.tab__nav_active {
        @apply bg-primary text-white;
      }
    }
  }
  .tab__content__item {
    @apply pt-8
  }

  /* Table */
  table.table {
    @apply w-full;
    thead {
      @apply bg-primaryLight text-left border-t border-b border-gray-400;
    }
    th {
      @apply py-3 px-4;
    }
    td {
      @apply px-4 py-2;
    }
    tbody tr {
      @apply border-b border-primaryLight;
    }
  }

  .fade-enter-active, .fade-leave-active {
    transition: opacity .5s;
  }
  .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
  }

  /* Modal */
  .modal-wrapper {
    @apply fixed top-0 left-0 w-full h-full z-50 flex justify-center items-center overflow-y-auto;
    background-color: rgba(#fff, .7);
  }
  .modal {
    @apply max-w-screen-md w-full bg-white rounded-xl overflow-x-hidden;
    box-shadow: 0px 7px 15px rgba(0, 0, 0, 0.15);
  }
  .modal__header {
    @apply px-4 py-4 border-b border-primaryLight flex justify-between items-center;
    h2.title {
      @apply mb-0;
    }
  }
  .modal__body {
    @apply p-4 py-6;
  }
  .map {
    min-height: 400px;
  }
</style>
