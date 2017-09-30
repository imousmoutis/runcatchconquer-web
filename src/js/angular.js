angular.module('run-catch-conquer', ['ngRoute', 'ipCookie', 'pascalprecht.translate', 'validation.match', 'ui.bootstrap'])
.config(['$routeProvider', '$httpProvider', '$locationProvider', function($routeProvider, $httpProvider, $locationProvider) {

$httpProvider.interceptors.push('responseObserver');

$locationProvider.hashPrefix('');

$routeProvider
	.when('/', {
		templateUrl : 'views/home.html',
		controller  : 'HomeController',
		resolve: {
			app: function($q, $rootScope, $location, ipCookie) {
				var defer = $q.defer();
				
				if (ipCookie('runcatchconquer_role') === 'User') 
					$location.path('/user');
				else if (ipCookie('runcatchconquer_role') === 'Admin') 
					$location.path('/administrator');
				
				defer.resolve();
				return defer.promise;
			}
		}
	})
	.when('/login', {
		templateUrl : 'views/login.html',
		controller  : 'LoginController',
		resolve: {
			app: function($q, $rootScope, $location, ipCookie) {
				var defer = $q.defer();
				
				if (ipCookie('runcatchconquer_role') === 'User') 
					$location.path('/user');
				else if (ipCookie('runcatchconquer_role') === 'Admin') 
					$location.path('/administrator');
				
				defer.resolve();
				return defer.promise;
			}
		}
	})
	.when('/register', {
		templateUrl : 'views/register.html',
		controller  : 'RegisterController',
		resolve: {
			app: function($q, $rootScope, $location, ipCookie) {
				var defer = $q.defer();
				
				if (ipCookie('runcatchconquer_role') === 'User') 
					$location.path('/user');
				else if (ipCookie('runcatchconquer_role') === 'Admin') 
					$location.path('/administrator');
				
				defer.resolve();
				return defer.promise;
			}
		}
	})
	.when('/administrator', {
		templateUrl : 'views/administrator.html',
		controller  : 'AdministratorController',
		resolve: {
			app: function($q, $rootScope, $location, ipCookie) {
				var defer = $q.defer();
				
				if (ipCookie('runcatchconquer_role') !== 'Admin') 
					$location.path('/');
				
				defer.resolve();
				return defer.promise;
			}
		}
	})
	.when('/user', {
		templateUrl : 'views/user.html',
		controller  : 'UserController',
		resolve: {
			app: function($q, $rootScope, $location, ipCookie) {
				var defer = $q.defer();
				
				if (ipCookie('runcatchconquer_role') !== 'User') 
					$location.path('/');
				
				defer.resolve();
				return defer.promise;
			}
		}
	})
	.when('/pokedex', {
		templateUrl : 'views/pokedex.html',
		controller  : 'PokedexController',
		resolve: {
			app: function($q, $rootScope, $location, ipCookie) {
				var defer = $q.defer();
				
				if (ipCookie('runcatchconquer_role') !== 'User') 
					$location.path('/');
				
				defer.resolve();
				return defer.promise;
			}
		}
	})
	.otherwise({
		redirectTo: '/404'
	});
}]).factory('responseObserver', ['$q', '$location', 'ipCookie', '$window', function responseObserver($q, $location, ipCookie, $window) {
	return {
		'responseError' : function(errorResponse) {
			switch (errorResponse.status) {
			case 401:

				if($location.path() !== '/login'){
	
					ipCookie.remove('runcatchconquer_token');
					ipCookie.remove('runcatchconquer_role');
					ipCookie.remove('runcatchconquer_id');
					ipCookie.remove('runcatchconquer_gender');

					$window.location.reload();
				}
				break;
			}
			return $q.reject(errorResponse);
		}
	};
}]).directive('ngViewFix',['$route', function ($route) {
	return function () {
		$route.reload();
	};
}])
.config(['$translateProvider', function ($translateProvider) {
	
	$translateProvider.useStaticFilesLoader({
		prefix: 'src/languages/',
		suffix: '.json'
	});
	
	$translateProvider.useSanitizeValueStrategy('escape');
}])
.controller('AdministratorController', ['$scope', '$rootScope', 'PokemonService', 'ipCookie', '$translate', '$filter', function($scope, $rootScope, PokemonService, ipCookie, $translate, $filter) {
	
	$rootScope.title = $translate.instant('Home');

	$('#HomePage').addClass('active');
	$scope.$on("$locationChangeStart", function() {
		$('#HomePage').removeClass('active');
	});

	$scope.pokemons = [];
	$scope.pokemons_list = [];
	var pokemons = [];
	$scope.generalView = true;
	$scope.id_sort = true;
	$scope.id_asc = true;
	$scope.name_sort = false;
	$scope.name_asc = false;

	$scope.itemsPerPage = 25;
	$scope.maxSize = 7;
	$scope.currentPage = 1;

	//$scope.$watch hack
	$scope.changesCount = 0;

	$scope.search = '';
	$scope.$watch('search', function(newValue, oldValue) {
			
		if (newValue != oldValue){

			$scope.pokemons_list = $filter('filter')($scope.pokemons_initialList, {name: newValue});

			$scope.totalItems = $scope.pokemons_list.length;
			$scope.currentPage = 1;
			$scope.changesCount++;
		}
	});


	//get all pokemons
	PokemonService.getAllPokemons().then(function(data){


		$scope.pokemons_initialList = data;
		$scope.pokemons_list = data;
		$scope.totalItems = $scope.pokemons_list.length;

		$scope.$watch('currentPage + changesCount', function() {
			
			var begin = (($scope.currentPage - 1) * $scope.itemsPerPage);
			var end = begin + $scope.itemsPerPage;
			$scope.pokemons = ($scope.pokemons_list.slice(begin, end));
		});
    });

    $scope.update = function(pokemon){

    	PokemonService.updatePokemon(pokemon);
    }

    var map, icon, marker, mapClickListener, bounds;

    var adminLocation = null;

    var markers= [];

	function initMap(location){

		if (location != null)
			adminLocation = new google.maps.LatLng(location.coords.latitude, location.coords.longitude);

		var mapStyle = [{"featureType":"all","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"administrative.locality","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#AFFFA0"}]},{"featureType":"poi","elementType":"all","stylers":[{"color":"#EAFFE5"}]},{"featureType":"poi.business","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"poi.government","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#f9f8c7"}]},{"featureType":"poi.park","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"geometry","stylers":[{"color":"#59A499"}]},{"featureType":"road","elementType":"geometry.stroke","stylers":[{"color":"#F0FF8D"},{"weight":2.2}]},{"featureType":"transit.line","elementType":"geometry","stylers":[{"visibility":"off"}]},{"featureType":"transit.station.airport","elementType":"geometry.fill","stylers":[{"color":"#fdfabf"}]},{"featureType":"water","elementType":"all","stylers":[{"visibility":"on"},{"color":"#1A87D6"}]}];
		var styledMap = new google.maps.StyledMapType(mapStyle, {name: "Styled Map"});
		
		var mapOptions = {
			scrollwheel: true,
			disableDefaultUI: true,
			zoomControl: true,
			zoomControlOptions: {
				style: google.maps.ZoomControlStyle.SMALL
			},
			center: adminLocation,
			mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'map_style'],
		};
		
		map = new google.maps.Map(document.getElementById('map'), mapOptions);
		
		map.mapTypes.set('map_style', styledMap);
		map.setMapTypeId('map_style');

	};

	function found(loc){
		initMap(loc);
	};
	function notFound(){
		initMap(null);
	}
	navigator.geolocation.getCurrentPosition(found, notFound);

	$scope.show= function(pokemon){

		bounds = new google.maps.LatLngBounds();

		bounds.extend(adminLocation);

		$scope.selectedPokemon = pokemon;

    	$scope.generalView = false;

		icon = {
			url: 'src/img/pokedex_resized.png',
			size: new google.maps.Size(40, 40),
  			origin: new google.maps.Point(0, (pokemon._id-1)*40),
  			scaledSize: new google.maps.Size(40, 6040)
		};

		angular.forEach(pokemon.locations, function(location, index) {

			marker = new google.maps.Marker({
				position: {lat: location.lat, lng: location.lng},
				icon: icon,
				map: map
			});

			google.maps.event.addListener(marker, 'click', (function(marker) { return function(){

				var removedLocation = pokemon.locations.splice(pokemon.locations.indexOf(location), 1);

				PokemonService.removeLocation(pokemon._id, location._id).then(function(response){

						$scope.locationRemoved = true;

						marker.setMap(null);

					},
					function(errorMessage) {

						pokemon.locations.push(removedLocation);

						map.fitBounds(bounds);
		                
		                $scope.actionFailed = true;
		            }
		        );
								
			};})(marker));

			markers.push(marker);

			bounds.extend(marker.position);

			map.fitBounds(bounds);
		});

		mapClickListener = google.maps.event.addListener(map, 'click', function(event) {

			var newLocation = {'lat': event.latLng.lat(), 'lng': event.latLng.lng()}

			pokemon.locations.push(newLocation);

			$scope.actionFailed = false;
			$scope.locationAdded = false;
			$scope.locationRemoved = false;
			  
			PokemonService.addLocation(pokemon._id, newLocation).then(function(response){

				$scope.locationAdded = true;

				marker = new google.maps.Marker({
					position: event.latLng,
					icon: icon,
					map: map,
					location: newLocation
				});

				google.maps.event.addListener(marker, 'click', (function(marker) { return function(){
							
					$scope.actionFailed = false;
					$scope.locationAdded = false;
					$scope.locationRemoved = false;

					var removedLocation = pokemon.locations.splice(pokemon.locations.indexOf(marker.location), 1);

					PokemonService.removeLocation(pokemon._id, response.location._id).then(function(response){

							$scope.locationRemoved = true;

							marker.setMap(null);

						},
						function(errorMessage) {

							pokemon.locations.push(removedLocation);

							map.fitBounds(bounds);
			                
			                $scope.actionFailed = true;
			            }
			        );	
				
				};})(marker));

				markers.push(marker);

				bounds.extend(marker.position);

				map.fitBounds(bounds);
				
			},
			function(errorMessage) {

				pokemon.locations.pop();

				map.fitBounds(bounds);
                
                $scope.actionFailed = true;
            }
        );
			
		});

		window.dispatchEvent(new Event('resize'));
			
    };

    $scope.cancel = function(){

    	google.maps.event.removeListener(mapClickListener);

    	$scope.actionFailed = false;
    	$scope.locationAdded = false;
		$scope.locationRemoved = false;
    	
    	$scope.generalView = true;

    	for (var i = 0; i < markers.length; i++) {
          	markers[i].setMap(null);
        }
    };

    window.addEventListener("resize", function(e) {
									
		setTimeout(function(){ 
							
			var center = map.getCenter();
			google.maps.event.trigger(map, "resize");
			map.setCenter(center); 
			map.fitBounds(bounds);
		}, 250);				
	});

	$scope.sortId = function(){

		$scope.name_sort = false;
		$scope.id_sort = true;
		$scope.id_asc = !$scope.id_asc;

		if (!$scope.id_asc){
			$scope.pokemons_list = $filter('orderBy')($scope.pokemons_list, '_id', true);
			$scope.pokemons_initialList = $filter('orderBy')($scope.pokemons_initialList, '_id', true);
		}
		else{
			$scope.pokemons_list = $filter('orderBy')($scope.pokemons_list, '_id', false);	
			$scope.pokemons_initialList = $filter('orderBy')($scope.pokemons_initialList, '_id', false);		
		}

		$scope.totalItems = $scope.pokemons_list.length;
		$scope.currentPage = 1;
		$scope.changesCount++;
	};

	$scope.sortName = function(){

		$scope.id_sort = false;
		$scope.name_sort = true;
		$scope.name_asc = !$scope.name_asc;

		if (!$scope.name_asc){
			$scope.pokemons_list = $filter('orderBy')($scope.pokemons_list, 'name', true);
			$scope.pokemons_initialList = $filter('orderBy')($scope.pokemons_initialList, 'name', true);
		}
		else{ 
			$scope.pokemons_list = $filter('orderBy')($scope.pokemons_list, 'name', false);		
			$scope.pokemons_initialList = $filter('orderBy')($scope.pokemons_initialList, 'name', false);		
		}

		$scope.totalItems = $scope.pokemons_list.length;
		$scope.currentPage = 1;
		$scope.changesCount++;
	};

}])
.controller('HomeController', ['$scope', '$rootScope', 'PokemonService', 'ipCookie', '$translate', function($scope, $rootScope, PokemonService, ipCookie, $translate) {
	
	$rootScope.title = $translate.instant('Home');

	$('#HomePage').addClass('active');
	$scope.$on("$locationChangeStart", function() {
		$('#HomePage').removeClass('active');
	});

	var map, markers, bounds, icon, marker;

	function initMap(){

		var mapStyle = [{"featureType":"all","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"administrative.locality","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#AFFFA0"}]},{"featureType":"poi","elementType":"all","stylers":[{"color":"#EAFFE5"}]},{"featureType":"poi.business","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"poi.government","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#f9f8c7"}]},{"featureType":"poi.park","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"geometry","stylers":[{"color":"#59A499"}]},{"featureType":"road","elementType":"geometry.stroke","stylers":[{"color":"#F0FF8D"},{"weight":2.2}]},{"featureType":"transit.line","elementType":"geometry","stylers":[{"visibility":"off"}]},{"featureType":"transit.station.airport","elementType":"geometry.fill","stylers":[{"color":"#fdfabf"}]},{"featureType":"water","elementType":"all","stylers":[{"visibility":"on"},{"color":"#1A87D6"}]}];
		var styledMap = new google.maps.StyledMapType(mapStyle, {name: "Styled Map"});
		
		var mapOptions = {
			scrollwheel: true,
			disableDefaultUI: true,
			zoomControl: true,
			zoomControlOptions: {
				style: google.maps.ZoomControlStyle.SMALL
			}
		};
		
		map = new google.maps.Map(document.getElementById('map'), mapOptions, {
			mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'map_style']
		});
		
		map.mapTypes.set('map_style', styledMap);
		map.setMapTypeId('map_style');

		bounds = new google.maps.LatLngBounds();

		//get all pokemons
		PokemonService.getAllPublicPokemons().then(function(pokemons){

				angular.forEach(pokemons, function(pokemon) {
								  	
				  	icon = {
					  	url: 'src/img/pokedex_resized.png',
					  	size: new google.maps.Size(40, 40),
  						origin: new google.maps.Point(0, (pokemon._id-1)*40),
  						scaledSize: new google.maps.Size(40, 6040)
					};

				  	angular.forEach(pokemon.locations, function(location) {
				  	
				  		marker = new google.maps.Marker({
				          position: {lat: location.lat, lng: location.lng},
				          icon: icon,
				          map: map
				        });

						bounds.extend(marker.position);

						map.fitBounds(bounds);
					});

				});
			},
			function(errorMessage) {
                console.warn(errorMessage);
            }
        );

        window.addEventListener("resize", function(e) {
									
			setTimeout(function(){ 
								
				var center = map.getCenter();
				google.maps.event.trigger(map, "resize");
				map.setCenter(center); 
				map.fitBounds(bounds);
			}, 250);				
		});
	};

	initMap();

}])
.controller('LoginController', ['$scope', '$rootScope', 'UserService', 'ipCookie', '$translate', '$window', function($scope, $rootScope, UserService, ipCookie, $translate, $window) {
	
	$rootScope.title = $translate.instant('Login');

	$scope.username = '';
	$scope.password = '';
	$scope.loginFailed = false;

	$('#LoginPage').addClass('active');
	$scope.$on("$locationChangeStart", function() {
		$('#LoginPage').removeClass('active');
	});

	$scope.login = function(){

		$scope.loginFailed = false;

		UserService.performLogin($scope.username, $scope.password).then(function(token){

				var now = new Date();
				exp = new Date(now.getFullYear(), now.getMonth()+6, now.getDate());

				ipCookie('runcatchconquer_token', token.token, { expires: exp });
				ipCookie('runcatchconquer_role', token.user.role, { expires: exp });
				ipCookie('runcatchconquer_id', token.user._id, { expires: exp });
				ipCookie('runcatchconquer_gender', token.user.gender, { expires: exp });

				$window.location.reload();
			},
			function(errorMessage) {
                
                $scope.loginFailed = true;
            }
        );
	};

}])
.controller('LogoutController', ['$scope', 'UserService', function($scope, UserService) {
	
	$scope.logout = function(){

		UserService.performLogout();
	};

}])
.controller('PokedexController', ['$scope', '$rootScope', 'PokemonService', 'UserService', '$translate', function($scope, $rootScope, PokemonService, UserService, $translate) {
	
	$rootScope.title = $translate.instant('Collection');

	$('#PokedexPage').addClass('active');
	$scope.$on("$locationChangeStart", function() {
		$('#PokedexPage').removeClass('active');
	});

	$scope.caught = 0;

	//get all pokemons
	PokemonService.getAllPokemons().then(function(pokemons){

		$scope.pokemons = pokemons;

		UserService.getCaughtPokemon().then(function(data){

			$scope.caught = data.length;

			angular.forEach($scope.pokemons, function(pokemon, key) {
				 
				if (data.indexOf(pokemon._id) != -1)
					pokemon.caught = true;
			});
				
		});
    });

    $scope.release = function(pokemon){

    	swal({
		  title: "",
		  text: "" +$translate.instant('ConfirmRelease1')+ ' ' +pokemon.name+ '' +$translate.instant('ConfirmRelease2'),
		  type: "warning",
		  showCancelButton: true,
		  confirmButtonColor: "#DD6B55",
		  confirmButtonText: $translate.instant('Yes'),
		  cancelButtonText: $translate.instant('No'),
		  closeOnConfirm: true
		},
		function(){

			UserService.releasePokemon(pokemon._id).then(function(){

				pokemon.caught = false;
				$scope.caught--;
			});
		});
    };

}])
.controller('RegisterController', ['$scope', '$rootScope', 'UserService', 'ipCookie', '$translate', '$location', function($scope, $rootScope, UserService, ipCookie, $translate, $location) {
	
	$rootScope.title = $translate.instant('Register');

	$scope.user = {
		username: '',
		password: '',
		gender: ''
	};

	$scope.password2 = '';

	$scope.registerFailed = false;

	$('#LoginPage').addClass('active');
	$scope.$on("$locationChangeStart", function() {
		$('#LoginPage').removeClass('active');
	});

	$scope.register = function(){

		$scope.registerFailed = false;

		UserService.performRegister($scope.user).then(function(response){

				$location.path('/login');
			},
			function(errorMessage) {
                
                $scope.registerFailed = true;
            }
        );
	};
}])
.controller('TranslateController', ['$scope', '$translate', 'ipCookie', function($scope, $translate, ipCookie) {
	
	$scope.languages = [{
		name: 'el',
		img: 'src/img/el.png'
	},
	{
		name: 'en',
		img: 'src/img/en.png'
	}];
		
	$scope.changeLanguage = function(id){
				
		$translate.use($scope.languages[id].name);
		$translate.instant($scope.languages[id].name);
		
		var now = new Date();
		exp = new Date(now.getFullYear()+10, now.getMonth(), now.getDate());
		ipCookie('runcatchconquer_language', $scope.languages[id].name, { expires: exp });
	};
	
	if (ipCookie('') != null){
		
		if (ipCookie('runcatchconquer_language') == 'el')
			$scope.changeLanguage(-1);
		else if (ipCookie('runcatchconquer_language') == 'en')
			$scope.changeLanguage(0);
	}else
		$translate.use($scope.languages[0].name);
	
}])
.controller('UserController', ['$scope', '$rootScope', 'PokemonService', 'ipCookie', '$translate', '$uibModal', 'Socket', function($scope, $rootScope, PokemonService, ipCookie, $translate, $uibModal, Socket) {
	
	$rootScope.title = $translate.instant('Home');

	$('#HomePage').addClass('active');
	$scope.$on("$locationChangeStart", function() {
		$('#HomePage').removeClass('active');
	});

	var map, bounds, icon, marker;
	var markers = [];

	function initMap(){

		var mapStyle = [{"featureType":"all","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"administrative.locality","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#AFFFA0"}]},{"featureType":"poi","elementType":"all","stylers":[{"color":"#EAFFE5"}]},{"featureType":"poi.business","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"poi.government","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#f9f8c7"}]},{"featureType":"poi.park","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"geometry","stylers":[{"color":"#59A499"}]},{"featureType":"road","elementType":"geometry.stroke","stylers":[{"color":"#F0FF8D"},{"weight":2.2}]},{"featureType":"transit.line","elementType":"geometry","stylers":[{"visibility":"off"}]},{"featureType":"transit.station.airport","elementType":"geometry.fill","stylers":[{"color":"#fdfabf"}]},{"featureType":"water","elementType":"all","stylers":[{"visibility":"on"},{"color":"#1A87D6"}]}];
		var styledMap = new google.maps.StyledMapType(mapStyle, {name: "Styled Map"});
		
		var mapOptions = {
			scrollwheel: true,
			disableDefaultUI: true,
			zoomControl: true,
			zoomControlOptions: {
				style: google.maps.ZoomControlStyle.SMALL
			}
		};
		
		map = new google.maps.Map(document.getElementById('fullmap'), mapOptions, {
			mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'map_style']
		});
		
		map.mapTypes.set('map_style', styledMap);
		map.setMapTypeId('map_style');

		bounds = new google.maps.LatLngBounds();

		//locate the user
		navigator.geolocation.getCurrentPosition(userLocation);
		function userLocation(location){

			var user_img;

			if (ipCookie('runcatchconquer_gender') == '1')
				user_img = 'src/img/misty.png';
			else
				user_img = 'src/img/ash.png';

			marker = new google.maps.Marker({
	          position: {lat: location.coords.latitude, lng: location.coords.longitude},
	          map: map,
	          icon: user_img
	        });

			bounds.extend(marker.position);

			map.fitBounds(bounds);
		}

		//get all pokemons
		PokemonService.getAllPublicPokemons().then(function(pokemons){

				angular.forEach(pokemons, function(pokemon) {
								  	
				  	icon = {
					  	url: 'src/img/pokedex_resized.png',
						size: new google.maps.Size(40, 40),
			  			origin: new google.maps.Point(0, (pokemon._id-1)*40),
			  			scaledSize: new google.maps.Size(40, 6040)
					};

				  	angular.forEach(pokemon.locations, function(location, index) {
				  	
				  		marker = new google.maps.Marker({
				          position: {lat: location.lat, lng: location.lng},
				          icon: icon,
				          map: map,
				          id: "" +pokemon._id+ "/" +location._id
				        });

				        google.maps.event.addListener(marker, 'click', (function(marker) { return function(){

					        var action = !!Math.floor(Math.random() * 2)

					        if (action)
					       		var actiontext = "<div class='star a'>🌟</div><div class='star'>🌟</div><div class='star b'>🌟</div><div class='gotcha'>"+$translate.instant('Gotcha')+"</div>";
					       	else
					       		var actiontext = "<div class='star a'>:(</div><div class='star'>:(</div><div class='star b'>:(</div><div class='gotcha'>"+$translate.instant('Escaped')+"</div>";

					        swal({
					        	html: true,
							 	title: "" +$translate.instant('Catching')+ " " +pokemon.name,
							  	text: "<div style='padding-top:80px'><div class='ball'><div class='red'></div><div class='belt'></div><div class='white'></div></div>" +actiontext+ '</div>',
							  	timer: 5000,
							  	showConfirmButton: false,
							  	customClass: "pokemon-swal"
							}, function (bIsConfirmed) {
							    window.sweetAlert.close();

							    if (action)
							    	PokemonService.catchPokemon(pokemon._id, location._id).then(function(){},
									function(errorMessage) {
						                console.warn(errorMessage);
						            });
							});

											
						};})(marker));

						markers.push(marker);

						bounds.extend(marker.position);

						map.fitBounds(bounds);
					});

				});

				Socket.on('pokemon:added', function (pokemon) {

          			icon = {
					  	url: 'src/img/pokedex_resized.png',
						size: new google.maps.Size(40, 40),
			  			origin: new google.maps.Point(0, (pokemon._id-1)*40),
			  			scaledSize: new google.maps.Size(40, 6040)
					};

					marker = new google.maps.Marker({
				        position: {lat: pokemon.location.lat, lng: pokemon.location.lng},
				        icon: icon,
				        map: map,
				        id: "" +pokemon._id+ "/" +pokemon.location._id
				    });

				    google.maps.event.addListener(marker, 'click', (function(marker) { return function(){

					    var action = !!Math.floor(Math.random() * 2)

					    if (action)
					        var actiontext = "<div class='star a'>🌟</div><div class='star'>🌟</div><div class='star b'>🌟</div><div class='gotcha'>"+$translate.instant('Gotcha')+"</div>";
					    else
					        var actiontext = "<div class='star a'>:(</div><div class='star'>:(</div><div class='star b'>:(</div><div class='gotcha'>"+$translate.instant('Escaped')+"</div>";

					    swal({
					        html: true,
							title: "" +$translate.instant('Catching')+ " " +pokemon.name,
							text: "<div style='padding-top:80px'><div class='ball'><div class='red'></div><div class='belt'></div><div class='white'></div></div>" +actiontext+ '</div>',
							timer: 5000,
							showConfirmButton: false,
							customClass: "pokemon-swal"
						}, function (bIsConfirmed) {
						
							window.sweetAlert.close();

							if (action)
							    
							    PokemonService.catchPokemon(pokemon._id, pokemon.location._id).then(function(){
					            },
								function(errorMessage) {
						            console.warn(errorMessage);
						        });
						});
											
					};})(marker));

				    markers.push(marker);

					bounds.extend(marker.position);
        		});

        		Socket.on('pokemon:removed', function (id) {

        			angular.forEach(markers, function(marker) {

					   	if (marker.id === id.marker_id)
					   		marker.setMap(null);
					});
        		});
			},
			function(errorMessage) {
                console.warn(errorMessage);
            }
        );

        window.addEventListener("resize", function(e) {
									
			setTimeout(function(){ 
								
				var center = map.getCenter();
				google.maps.event.trigger(map, "resize");
				map.setCenter(center); 
				map.fitBounds(bounds);
			}, 250);				
		});
	};

	initMap();

}])
.service('PokemonService', [ '$http', 'sharedProperties', '$q', 'ipCookie', function ($http, sharedProperties, $q, ipCookie) {
	
	return({
	 	getAllPublicPokemons: getAllPublicPokemons,
        getAllPokemons: getAllPokemons,
        updatePokemon: updatePokemon,
        addLocation: addLocation,
        removeLocation: removeLocation,
        catchPokemon: catchPokemon
    });

    function getAllPublicPokemons(){

    	var request = $http({
    		method: "GET",
    		url: sharedProperties.appUrl + "pokemons/public/"
        });
        
        return(request.then(handleSuccess, handleError));
    };

    function getAllPokemons(){

        var request = $http({
            method: "GET",
            headers : {
                'Authorization': ipCookie('runcatchconquer_token')
            },
            url: sharedProperties.appUrl + "pokemons/"
        });
        
        return(request.then(handleSuccess, handleError));
    };

    function updatePokemon(pokemon){

        var request = $http({
            method: "PUT",
            data: pokemon,
            headers : {
                'Authorization': ipCookie('runcatchconquer_token')
            },
            url: sharedProperties.appUrl + "pokemons/"
        });
        
        return(request.then(handleSuccess, handleError));
    };

    function addLocation(id, location){

        var request = $http({
            method: "PUT",
            data: {
            	pokemon_id: id,
            	location: location
            },
            headers : {
                'Authorization': ipCookie('runcatchconquer_token')
            },
            url: sharedProperties.appUrl + "pokemons/locations/add"
        });
        
        return(request.then(handleSuccess, handleError));
    };

    function removeLocation(id, location_id){

        var request = $http({
            method: "PUT",
            data: {
            	pokemon_id: id,
            	location_id: location_id
            },
            headers : {
                'Authorization': ipCookie('runcatchconquer_token')
            },
            url: sharedProperties.appUrl + "pokemons/locations/remove"
        });
        
        return(request.then(handleSuccess, handleError));
    };

    function catchPokemon(pokemon_id, location_id){

    	var request = $http({
            method: "PUT",
            data: {
            	pokemon_id: pokemon_id,
            	location_id: location_id
            },
            headers : {
                'Authorization': ipCookie('runcatchconquer_token')
            },
            url: sharedProperties.appUrl + "pokemons/catch"
        });
        
        return(request.then(handleSuccess, handleError));
    }

    function handleError(response) {
                   
        if (!angular.isObject(response.data) || !response.data.message)
            return($q.reject("An unknown error occurred."));
        
      	return($q.reject(response.data.message));
    };
                
    function handleSuccess(response) {
        
        return(response.data);         
    };
}])
.service('sharedProperties', [ function () {
	
	var _appUrl = 'https://run-catch-conquer-api-kgydislypk.now.sh/runcatchconquer-api/';
	this.appUrl = _appUrl;
}])
.service('UserService', [ '$http', 'sharedProperties', '$q', 'ipCookie', '$window', function ($http, sharedProperties, $q, ipCookie, $window) {
	
	return({
	 	performLogin: performLogin,
        performLogout: performLogout,
        performRegister: performRegister,
        getCaughtPokemon: getCaughtPokemon,
        releasePokemon: releasePokemon
    });

    function performLogin(username, password){

    	var request = $http({
    		method: "POST",
            data: {username: username, password: password},
    		url: sharedProperties.appUrl + "users/login"
        });
        
        return(request.then(handleSuccess, handleError));
    };

    function performLogout(){

        var request = $http({
            method: "GET",
            headers : {
                'Authorization': ipCookie('runcatchconquer_token')
            },
            url: sharedProperties.appUrl + "users/logout"
        });


        ipCookie.remove('runcatchconquer_token');
        ipCookie.remove('runcatchconquer_role');
        ipCookie.remove('runcatchconquer_id');
        ipCookie.remove('runcatchconquer_gender');

        $window.location.reload();        
    };

    function performRegister(user){

        var request = $http({
            method: "POST",
            data: user,
            url: sharedProperties.appUrl + "users/"
        });
        
        return(request.then(handleSuccess, handleError));
    };

    function getCaughtPokemon(){

    	var request = $http({
            method: "GET",
            headers : {
                'Authorization': ipCookie('runcatchconquer_token')
            },
            url: sharedProperties.appUrl + "users/pokemons"
        });
        
        return(request.then(handleSuccess, handleError)); 
    };

    function releasePokemon(pokemon_id){

    	var request = $http({
            method: "PUT",
            data: {pokemon_id: pokemon_id},
            headers : {
                'Authorization': ipCookie('runcatchconquer_token')
            },
            url: sharedProperties.appUrl + "users/pokemons/"
        });
        
        return(request.then(handleSuccess, handleError)); 
    };

    function handleError(response) {
                   
        if (!angular.isObject(response.data) || !response.data.message)
            return($q.reject("An unknown error occurred."));
        
      	return($q.reject(response.data.message));
    };
                
    function handleSuccess(response) {
        
        return(response.data);
    };
}])
.directive('navbar', ['ipCookie', function(ipCookie) {
		
	if (ipCookie('runcatchconquer_role') == 'Admin') 
		return {
			scope: {
				global: "=navbar" 
			},
			template :'<nav class="navbar navbar-default">'
			+'<div class="container">'
			+'<input type="checkbox" id="navbar-toggle-cbox">'
			+'<div class="navbar-header">'
			+'<label for="navbar-toggle-cbox" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">'
			+'<span class="sr-only">Toggle</span>'
			+'<span class="icon-bar"></span>'
			+'<span class="icon-bar"></span>'
			+'<span class="icon-bar"></span>'
			+'</label>'
			+'<a class="navbar-brand" href="/">RunCatchConquer</a>'
			+'</div>'
			+'<div id="navbar" class="navbar-right navbar-collapse collapse">'
			+'<ul class="nav navbar-nav">'
			+'<li id="HomePage"><a href="/">{{"Home" | translate}}</a></li>'
			+'<li data-ng-controller="LogoutController"><a data-ng-click="logout()" href="">{{"Logout" | translate}}</a></li>'
			+'</ul>'
			+'</div>'
			+'</div>'
			+'</nav>'
		};
	else if (ipCookie('runcatchconquer_role') == 'User') 
		return {
			scope: {
				global: "=navbar" 
			},
			template :'<nav class="navbar navbar-default">'
			+'<div class="container">'
			+'<input type="checkbox" id="navbar-toggle-cbox">'
			+'<div class="navbar-header">'
			+'<label for="navbar-toggle-cbox" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">'
			+'<span class="sr-only">Toggle</span>'
			+'<span class="icon-bar"></span>'
			+'<span class="icon-bar"></span>'
			+'<span class="icon-bar"></span>'
			+'</label>'
			+'<a class="navbar-brand" href="/">RunCatchConquer</a>'
			+'</div>'
			+'<div id="navbar" class="navbar-right navbar-collapse collapse">'
			+'<ul class="nav navbar-nav">'
			+'<li id="HomePage"><a href="/">{{"Home" | translate}}</a></li>'
			+'<li id="PokedexPage"><a href="#pokedex">{{"Collection" | translate}}</a></li>'
			+'<li data-ng-controller="LogoutController"><a data-ng-click="logout()" href="">{{"Logout" | translate}}</a></li>'
			+'</ul>'
			+'</div>'
			+'</div>'
			+'</nav>'
		};
	else
		return {
			scope: {
				global: "=navbar" 
			},
			template :'<nav class="navbar navbar-default">'
			+'<div class="container">'
			+'<input type="checkbox" id="navbar-toggle-cbox">'
			+'<div class="navbar-header">'
			+'<label for="navbar-toggle-cbox" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">'
			+'<span class="sr-only">Toggle</span>'
			+'<span class="icon-bar"></span>'
			+'<span class="icon-bar"></span>'
			+'<span class="icon-bar"></span>'
			+'</label>'
			+'<a class="navbar-brand" href="/">RunCatchConquer</a>'
			+'</div>'
			+'<div id="navbar" class="navbar-right navbar-collapse collapse">'
			+'<ul class="nav navbar-nav">'
			+'<li id="HomePage"><a href="/">{{"Home" | translate}}</a></li>'
			+'<li id="LoginPage"><a href="#login">{{"Login" | translate}}</a></li>'
			+'</ul>'
			+'</div>'
			+'</div>'
			+'</nav>'
		};
	
}])
.factory('Socket', ['$rootScope', function($rootScope) {
     
    var socket = io.connect('https://run-catch-conquer-api-kgydislypk.now.sh');
    return {
      on: function (eventName, callback) {
        socket.on(eventName, function () {  
          var args = arguments;
          $rootScope.$apply(function () {
            callback.apply(socket, args);
          });
        });
      },
      emit: function (eventName, data, callback) {
        socket.emit(eventName, data, function () {
          var args = arguments;
          $rootScope.$apply(function () {
            if (callback) {
              callback.apply(socket, args);
            }
          });
        })
      }
    };
     
}])
.filter('html', ['$sce', function($sce) {
    return function(input){
        return $sce.trustAsHtml(input);
    }
}])