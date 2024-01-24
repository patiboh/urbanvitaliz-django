import Alpine from 'alpinejs'

import geolocUtils from '../utils/geolocation/'
import mapUtils from '../utils/map/'

function ProjectLocation(projectOptions, modal=true) {
	return {
		mapIsSmall: true,
		project: null,
		mapModal: null,
		mapStatic: null,
		interactiveMap: null,
		zoom: 8,
		isLoading: false,

		get isBusy() {
				return this.$store.geolocation.isLoading
		},

		async init() {
			this.project = {
				...projectOptions,
				commune: {
					...projectOptions.commune,
					latitude: projectOptions.commune.latitude,
					longitude: projectOptions.commune.longitude
				}
			}
			const { latitude, longitude, insee, name } = this.project.commune;
			this.zoom = latitude && longitude ? this.zoom + 5 : this.zoom;
			const geoData = {}

			// this.$store.geolocation.initGeolocationData(this.project)
			// let geoData
			// try {
			// 	geoData = this.$store.geolocation.getGeoData()

			try {
				[geoData.parcels, geoData.commune, geoData.location] = await Promise.all([
					geolocUtils.fetchParcelsIgn(insee),
					geolocUtils.fetchCommuneIgn(insee),
					geolocUtils.fetchGeolocationByAddress(`${this.project.location} ${name} ${insee}`)
				]);
			} catch(e) {
				console.log(e)
			}
			await	this.$store.geolocation.initMapViewer({mapId: 'map-static', interactive: false, containerId: "container-map-static"})
		
			if(modal) {
				await this.initInteractiveMap(this.project, geoData);
			}

			// Init Modal
			this.isLoading = false;
		},

		// async initStaticMap(project, geoData) {
		// 	const options = mapUtils.mapOptions({interactive: false});

		// 	const Map = await mapUtils.initSatelliteMap('map-static', project, options, this.zoom);
		// 	this.mapStatic = Map;
		// 	let markers = mapUtils.initMarkerLayer(this.mapStatic, project, geoData);
		// 	if(!markers) {
		// 		mapUtils.initMapLayers(this.mapStatic, project, geoData);
		// 	}
		// },

		invalidateSize() {
			const mapStatic = this.$store.geolocation.mapStatic
			setTimeout(function(){mapStatic.invalidateSize()}, 0);
		},
		async initInteractiveMap(project, geoData) {
			// Init Interactive Map
			const options = mapUtils.mapOptions({interactive: true});

			const Map = mapUtils.initSatelliteMap('map-interactive', project, options, this.zoom + 3);
			this.interactiveMap = Map;
			let markers = mapUtils.initMarkerLayer(this.interactiveMap, project, geoData);
			if(markers.length === 0) 	{
				mapUtils.initMapLayers(this.interactiveMap, project, geoData);
			}
			if(geoData.parcels) {
				await  mapUtils.addLayerParcels(Map, geoData.parcels);
			}
			this.interactiveMap.setMinZoom(this.zoom - 7);
			this.interactiveMap.setMaxZoom(this.zoom + 6);
			L.control.zoom({
				position: 'topright',
				color: '#335B7E',
			}).addTo(this.interactiveMap);
			const [latitude, longitude] = mapUtils.getDefaultLatLngForMap(project, geoData)
			this.interactiveMap.panTo(new L.LatLng(latitude, longitude));

			// Init Modal
			const element = document.getElementById("project-map-modal");
			this.mapModal = new bootstrap.Modal(element);
			element.addEventListener('shown.bs.modal', function (event) {
				 // forces map redraw to fit container
				setTimeout(function(){Map.invalidateSize()}, 0);
			})
		},

		openProjectMapModal() {
			this.mapIsSmall = false;
			this.mapModal.show();
		},
	}
}


Alpine.data("ProjectLocation", ProjectLocation)