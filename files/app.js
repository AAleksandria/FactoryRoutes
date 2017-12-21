
      var map;                  // переменная с картой 
      var latlngmap;            // координаты построения карты
      var latlngA;              // координаты начального пути
      var latlngB;              // координаты конечного пути
      var directionsDisplay;    // обеспечивает отображение пути, маркеров
      var directionsService;    // объект взаимодействует c Direction Service API, 
                                // получает запросы маршрутов и возвращает рассчитанные результаты

      var routeFromJSON;        // хранит данные с файла dbRoute.json

      var comboFactory = document.getElementById('factory');
      var comboRoute = document.getElementById('route');

      // чтение файла files/dbRoute.json, в котором хранятся маршруты заводов  
      $.getJSON("files/dbRoute.json", function(data) {
        routeFromJSON = data;
      });


      // инициализация карты, установка addListener для перехвата DOM событий
      function initMap() {
        directionsDisplay = new google.maps.DirectionsRenderer({
          draggable: true
        });                                                     // обеспечивает отображение пути, маркеров
        directionsService = new google.maps.DirectionsService;  // объект взаимодействует c Direction Service API, 
                                                                // получает запросы маршрутов и возвращает рассчитанные результаты
        
        latlngmap = new google.maps.LatLng(47.769022, 29.0105566);
        
        map = new google.maps.Map(document.getElementById('map'), {
          zoom: 14,
          center: latlngmap
        });                                                     // создаём карту для отображения 

        directionsDisplay.setMap(map);                          // вывод карты  
        loadCombo();

        comboFactory.addEventListener('change', function() {
          calculateAndDisplayRoute(directionsService, directionsDisplay);
        });

        comboRoute.addEventListener('change', function() {
          calculateAndDisplayRoute(directionsService, directionsDisplay);
        });

        // после перетаскивания пути будет изменён вывод описания
        directionsDisplay.addListener('directions_changed', function() {
          computeTotalDistance(directionsDisplay.getDirections());
        });
      }

      // запись элементов списка с заводами для выбора
      function loadCombo(){

        // создание элементов списка отвечающие за выбор заводов (select id factory)
        for(var i = 0; i < routeFromJSON.length; i++){
          comboFactory.options[comboFactory.options.length] = new Option(routeFromJSON[i]["factory"], routeFromJSON[i]["value"]);
        }
        
        // event listener для списка с заводами
        comboFactory.addEventListener('change', function() {

          // удаление списка с маршрутами 
          for (var i=comboRoute.options.length-1; i >= 0; i--){
            comboRoute.remove(i);
          }

          // создание элементов списка отвечающие за выбор маршрутов (select id route)
          for(var i = 0; i < routeFromJSON.length; i++){ 
            if (routeFromJSON[i]["value"] === comboFactory.value){
              var myroute = routeFromJSON[i]["route"]
              for(var j = 0; j < myroute.length; j++){
                comboRoute.options[comboRoute.options.length] = new Option(myroute[j]["route_name"], myroute[j]["value"]);
              }
            }
          }
        });
      }

      // когда перетаскиваем путь меняет данные на новые 
      function computeTotalDistance(result) {
        var route = result.routes[0];
        var summaryPanel = document.getElementById('directions-panel');
            summaryPanel.innerHTML = '';
            summaryPanel.style.visibility = "visible";

        // вывод информации о маршруте в блоке div#directions-panel 
        for (var i = 0; i < route.legs.length; i++) {
          var routeSegment = i + 1;
          summaryPanel.innerHTML += '<b>Route Segment: ' + routeSegment +
              '</b><br>';
          summaryPanel.innerHTML += route.legs[i].start_address + ' to ';
          summaryPanel.innerHTML += route.legs[i].end_address + '<br>';
          summaryPanel.innerHTML += route.legs[i].distance.text + '<br><br>';
          }
      }
      
      // генерация пути 
      function calculateAndDisplayRoute(directionsService, directionsDisplay) {
          var waypts = [];       // массив с промежуточными точками
          var routes;            // объект с данными о маршруте

          for (var i = 0; i < routeFromJSON.length; i++){
            if (routeFromJSON[i]["value"] == comboFactory.value){
              routes = routeFromJSON[i]["route"];
            }
          }

          // проверка на выбор маршрута по combobox
          for (var iterRoutes = 0; iterRoutes < routes.length; iterRoutes++){
            if (routes[iterRoutes]["value"] == parseInt(comboRoute.value)){
              
              // точки lat lng для start_point 
              var latA = routes[iterRoutes]["start_point"][0];
              var lngA = routes[iterRoutes]["start_point"][1];

              // точки lat lng для end_point 
              var latB = routes[iterRoutes]["end_point"][0];
              var lngB = routes[iterRoutes]["end_point"][1];

              latlngA = new google.maps.LatLng(latA,lngA);      // начальная точка маршрута "start_point" с файла dbRoutes.json
              latlngB = new google.maps.LatLng(latB,lngB);      // конечная точка маршрута "end_point" с файла dbRoutes.json

              var cntWaypts = routes[iterRoutes]["waypoints"].length;    // количество промежуточных точек

              for (var iterWaypts = 0; iterWaypts < cntWaypts; iterWaypts++){
                var first = routes[iterRoutes]["waypoints"][iterWaypts]["points"][0];
                var second = routes[iterRoutes]["waypoints"][iterWaypts]["points"][1];
                
                var pointWay = new google.maps.LatLng(first,second);
                waypts.push({
                  location: pointWay,
                  stopover: true
                });
              }
            }
          }


          directionsService.route({                                 // посылаем на сервер данные с начальным,
            origin: latlngA,                                        // конечным путём и способом передвежения
            destination: latlngB,  
            waypoints: waypts,
            optimizeWaypoints: true,
            travelMode: 'DRIVING'
          }, function(response, status) {                           // ответом служит готовый путь
            if (status == 'OK') {
              directionsDisplay.setDirections(response);            // отображаем путь на карте
              var route = response.routes[0];

              var summaryPanel = document.getElementById('directions-panel');
                  summaryPanel.innerHTML = '';
                  summaryPanel.style.visibility = "visible";

              // вывод информации о маршруте в блоке div#directions-panel 
              for (var i = 0; i < route.legs.length; i++) {
                var routeSegment = i + 1;
                summaryPanel.innerHTML += '<b><i>Маршрут:</i> ' + routeSegment +'</b><br>';
                summaryPanel.innerHTML += "<b>Откуда:</b> " + route.legs[i].start_address + '<br>';
                summaryPanel.innerHTML += "<b>Куда:</b> " + route.legs[i].end_address + '<br>';
                summaryPanel.innerHTML += "<b>Расстояние:</b> " + route.legs[i].distance.text + '<br>';
                summaryPanel.innerHTML += "<b>Время:</b> " + route.legs[i].duration.text + '<br><br>';
              }
            } else {
              window.alert('Directions request failed due to ' + status);
            }
          });
        }


