import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CurrentWeatherDTO } from './dtos/current-weather.dto';
import { WeatherService } from './services/weather.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { WeatherDTO } from './dtos/weather.dto';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'weather-fe';
  currentWeather!: CurrentWeatherDTO | null;
  city!: string | null;
  isC: boolean = true;
  unit: string = "°C";
  closeResult!: string;
  weatherHistories!: WeatherDTO[] | null;
  from!: string;
  to!: string;
  updateForm!: FormGroup;
  lat!: number;
  lon!: number;
  defaultTo = new Date();
  defaultFrom = this.getFirstDateOfMonth();

  constructor(
    private weatherService: WeatherService,
    private toastrService: ToastrService,
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.getPosition().then(res =>{
      this.lat=res.lat;
      this.lon=res.lng;
    });
    this.loadHistoricalWeather();
  }

    onClick(){
    if (this.city == null || this.city == "") return;
    this.weatherService.getCurrentWeather(this.city).subscribe(
      res => {
        this.currentWeather = res
        if (this.isC) {
          this.currentWeather.weather.tempMax = this.kToC(this.currentWeather.weather.tempMax)
          this.currentWeather.weather.tempMin = this.kToC(this.currentWeather.weather.tempMin)
          this.currentWeather.weather.temp = this.kToC(this.currentWeather.weather.temp)
        } else {
          this.currentWeather.weather.tempMax = this.kToF(this.currentWeather.weather.tempMax)
          this.currentWeather.weather.tempMin = this.kToF(this.currentWeather.weather.tempMin)
          this.currentWeather.weather.temp = this.kToF(this.currentWeather.weather.temp)
        }
      },
      error => {
        this.toastrService.error("City not found!")
      }
    )
  }

  createWeather() {
    if (this.city !== null || this.city !== "" ) {
      this.weatherService.createWeather(this.city!).subscribe(
        res => {
          this.city = "";
          this.toastrService.success("Succesfull!");
          this.currentWeather = null
        }
      )
    }
    if(this.currentWeather!==null &&(this.city === null || this.city === "")){
       this.weatherService.createWeather(this.currentWeather.city.name!).subscribe(
        res => {
          this.city = "";
          this.toastrService.success("Succesfull!");
          this.currentWeather = null
        }
      )
    }
  }

  closeWeather() {
    this.currentWeather = null
    this.city = null
  }

  capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  changeUnit() {
    if (this.isC && this.currentWeather !== null) {
      this.currentWeather!.weather!.tempMax = this.fToC(this.currentWeather!.weather.tempMax)
      this.currentWeather!.weather.tempMin = this.fToC(this.currentWeather!.weather.tempMin)
      this.currentWeather!.weather.temp = this.fToC(this.currentWeather!.weather.temp)
      this.unit = "°C";
    } else {
      this.currentWeather!.weather.tempMax = this.cToF(this.currentWeather!.weather.tempMax)
      this.currentWeather!.weather.tempMin = this.cToF(this.currentWeather!.weather.tempMin)
      this.currentWeather!.weather.temp = this.cToF(this.currentWeather!.weather.temp)
      this.unit = "°F"
    }
  }

  getFromValue(event: any) {
    this.from = event.target.value
  }

  getToValue(event: any) {
    this.to = event.target.value
  }

  changeToC() {
    if (this.isC == false && this.currentWeather != null) {
      this.isC = true;
      this.changeUnit();
    }
  }

  changeToF() {
    if (this.isC == true && this.currentWeather != null) {
      this.isC = false;
      this.changeUnit();
    }

  }

  kToC (temp: number): number {
    return (temp - 273);
  }

  kToF(temp: number): number {
    return temp*1.8 - 459.7
  }

  fToC(temp: number): number {
    return (temp-32)/1.8
  }

  cToF(temp: number): number {
    return (temp)*1.8 + 32;
  }

  openBackDropCustomClass(content: any, weather: WeatherDTO) {
    this.modalService.open(content, {backdropClass: 'light-blue-backdrop'});
    this.openEditWeatherModal(weather);
  }

getWeatherHistory() {
    if (this.from !== undefined && this.to !== undefined) {      
      this.weatherService.getHistoricalWeather(this.generateDatabaseDateTime(new Date(this.from)),
      this.generateDatabaseDateTime(new Date(this.to))).subscribe(
        res => {
          if (res.length !== 0) {
            this.weatherHistories = [...res]
          }
          if(res.length===0){
              this.toastrService.error("Don't have any weather history in data!")
          }
        }
      )

    }
  }

  generateDatabaseDateTime(date: Date): string {
    return date.toISOString().replace("T"," ").substring(0, 19);
  }

  deleteAll() {
    this.weatherService.deleteHistoricalWeather(this.from, this.to).subscribe(
      res => {
        this.weatherHistories = null;
        this.toastrService.success("Delete all successfull!")
      }
    )
  }

  clear() {
    this.weatherHistories = null;
  }

  updateWeatherHistory() {
    Object.keys(this.updateForm.controls).forEach(key => this.updateForm.controls[key].markAsDirty());
    if (this.updateForm.invalid) return;

    const { id, date, temp, tempMax, tempMin, pressure, humidity } = this.updateForm.getRawValue();
    const weatherDTO: WeatherDTO = {
      date: date,
      temp: temp,
      tempMax: tempMax,
      tempMin: tempMin,
      pressure: pressure,
      humidity: humidity
    } as WeatherDTO

    this.weatherService.updateHistoricalWeather(weatherDTO, id).subscribe(
      res => {
        this.toastrService.success("Update weather history successfull!")
        this.updateForm.reset()
        this.modalService.dismissAll()

        this.weatherHistories?.forEach(w => {
          if (w.id === id) {
            w.temp = temp;
            w.tempMin = tempMin;
            w.tempMax = tempMax;
            w.pressure = pressure;
            w.humidity = humidity;
          }
        })
      }
    )

  }

  openEditWeatherModal(weather: WeatherDTO) {
    this.updateForm = this.formBuilder.group({
      id: weather.id,
      date: [{value: weather.date, disabled: true}, {disabled: true}, [Validators.required]],
      temp: [weather.temp, [Validators.required]],
      tempMax: [weather.tempMax, [Validators.required]],
      tempMin: [weather.tempMin, [Validators.required]],
      pressure: [weather.pressure, [Validators.required]],
      humidity: [weather.humidity, [Validators.required]],
      city: [{value: weather.city.name, disabled: true}, [Validators.required]]
    })
  }

  delete(weatherId: number) {

    this.weatherService.deleteHistoricalWeatherById(weatherId).subscribe(
      res => {
        this.weatherHistories = this.weatherHistories?.filter(w => w.id != weatherId)!
        this.toastrService.success("Delete successfull!")
        if (this.weatherHistories.length === 0) this.weatherHistories = null;
      }
    )
  }

  getPosition(): Promise<any>
  {
    return new Promise((resolve, reject) => {

      navigator.geolocation.getCurrentPosition(resp => {

          resolve({lng: resp.coords.longitude, lat: resp.coords.latitude});
        },
        err => {
          reject(err);
        });
    });

  }

  getWeathersAtYourLocation(){

    this.weatherService.getWeathersAtYourLocation(this.lat,this.lon).subscribe(
      res => {
        this.currentWeather = res
        this.city=res.city.name
        if (this.isC) {
          this.currentWeather.weather.tempMax = this.kToC(this.currentWeather.weather.tempMax)
          this.currentWeather.weather.tempMin = this.kToC(this.currentWeather.weather.tempMin)
          this.currentWeather.weather.temp = this.kToC(this.currentWeather.weather.temp)
        } else {
          this.currentWeather.weather.tempMax = this.kToF(this.currentWeather.weather.tempMax)
          this.currentWeather.weather.tempMin = this.kToF(this.currentWeather.weather.tempMin)
          this.currentWeather.weather.temp = this.kToF(this.currentWeather.weather.temp)
        }
      },
      error => {
        this.toastrService.error("City not found!")
      }
    )
  }

  confirmBox(id: number){
    Swal.fire({
      title: 'Are you sure want to remove this weather?',
      text: 'You will not be able to recover this file!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it'
    }).then((result) => {
      if (result.value) {
        console.log(result);
        
        this.delete(id);

      } else if (result.dismiss === Swal.DismissReason.cancel) {
        this.toastrService.error("Cancelled!")

      }
    })
  }
  confirmAllBox(){
    Swal.fire({
      title: 'Are you sure want to remove all?',
      text: 'You will not be able to recover this file!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it'
    }).then((result) => {
      if (result.value) {
        this.deleteAll();

      } else if (result.dismiss === Swal.DismissReason.cancel) {
        this.toastrService.error("Cancelled!")

      }
    })
  }

  getFirstDateOfMonth(): Date {
    let date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1)
  }

  loadHistoricalWeather() {
    let from = this.generateDatabaseDateTime(new Date(this.defaultFrom.toDateString()));
    let to = this.generateDatabaseDateTime(new Date(this.defaultTo.toDateString()));

    this.weatherService.getHistoricalWeather(from, to).subscribe(
      res => {
        if (res.length !== 0) {
          console.log('abc')
          this.weatherHistories = [...res]        
        }
      }
    )
  }
}
