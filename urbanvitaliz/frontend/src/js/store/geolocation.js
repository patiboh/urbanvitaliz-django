import Alpine from 'alpinejs'

import geolocUtils from '../utils/geolocation/'
import mapUtils from '../utils/map/'

function resize(mapId, containerId) {
    const container = document.getElementById(containerId);
    const map = document.getElementById(mapId);
    // Get the size in which the browser will display the map
    const displayWidth = container.clientWidth
    const displayHeight = container.clientHeight

    // Check if the map is the same size
    if (map.width !== displayWidth || map.height !== displayHeight) {
        // If not, make it the same
        map.width = displayWidth
        map.height = displayHeight
    }
}

document.addEventListener('alpine:init', () => {

    Alpine.store('geolocation', {
        project: null,
        parcels: null,
        commune: null,
        location: null,
        latitude: null,
        longitude: null,
		isLoading: false,
		mapStatic: null,
		mapViewer: null,
		mapEditor: null,
        zoom: 8,
        modal: null,

        async initGeolocationData(project) {
            if(this.project?.id !== project.id) {
                this.isLoading = true;
                this.project = project
                const { insee } = this.project.commune;
                try {
                    this.parcels = await geolocUtils.fetchParcelsIgn(insee);
                    this.commune = await geolocUtils.fetchCommuneIgn(insee);
                    this.location = await geolocUtils.fetchGeolocationByAddress(this.project.location);
                    [this.latitude, this.longitude] = mapUtils.getDefaultLatLngForMap(this.project);
                } catch(e) {
                    console.log(e)
                }
                finally{
                    this.isLoading = false;
                }
            }
        },
        async initMapViewer({mapId, interactive, modalId, containerId}) {
            const options = mapUtils.mapOptions({interactive});
            const zoom = interactive ? this.zoom + 3 : this.zoom

			const Map = await mapUtils.initSatelliteMap(mapId, this.project, options, zoom);
			let markers = await mapUtils.initMarkerLayer(Map, this.project, this.getGeoData());
			if(!markers || markers.length === 0) {
				mapUtils.initMapLayers(Map, this.project, this.getGeoData());
			}
            const [latitude, longitude] = mapUtils.getDefaultLatLngForMap(this.project, this.getGeoData())
            if(interactive) {
                if(this.parcels) {
                    await mapUtils.addLayerParcels(Map, this.parcels);
                }
                Map.setMinZoom(zoom - 7);
                Map.setMaxZoom(zoom + 6);
                L.control.zoom({
                    position: 'topright',
                    color: '#335B7E',
                }).addTo(this.mapViewer);

                Map.panTo(new L.LatLng(latitude, longitude));
                this.mapViewer = Map;
                // Init Modal
                const element = document.getElementById(modalId);
                if(element) {
                    this.modal = new bootstrap.Modal(element);
                    element.addEventListener('shown.bs.modal', function (event) {
                        // forces map redraw to fit container
			            setTimeout(function(){Map.invalidateSize()}, 400);
                    })
                }
            } else {
                Map.panTo(new L.LatLng(latitude, longitude));
                setTimeout(function(){
                    resize(mapId, containerId);
                    Map.invalidateSize()}, 
                0);
                this.mapStatic = Map;
            }
        },
        initMapEditor(mapId) {
            return this.isLoading
        },
        isLoading() {
            return this.isLoading
        },
        isLoading() {
            return this.isLoading
        },
        getParcels() {
            return this.parcels
        },
        getCommune() {
            return this.commune
        },
        getAddress() {
            return this.location
        },
        getLatLng() {
            return [this.latitude, this.longitude]
        },
        getMapViewer() {
            return this.mapViewer
        },
        getGeoData() {
            return {  
                parcels: this.parcels,
                commune: this.commune,
                location: this.location,
                latitude: this.latitude,
                longitude: this.longitude,
            }
        },
		updateProjectLocation(coordinates)  {
            this.longitude = coordinates.lng
			this.latitude = coordinates.lat
		},
    })
})

export default Alpine.store('geolocation')
