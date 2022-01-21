import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CurrentWeatherDTO } from './dtos/current-weather.dto';
import { WeatherService } from './services/weather.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { WeatherDTO } from './dtos/weather.dto';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'weather-fe';
  currentWeather!: CurrentWeatherDTO;  
  city!: string;
  isC: boolean = true;
  unit: string = "°C";
  closeResult!: string;
  weatherHistories!: WeatherDTO[];
  from!: string;
  to!: string;

  constructor(
    private weatherService: WeatherService,
    private toastrService: ToastrService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    
  }

  onClick(){
    if (this.city == null || this.city == "") return;
    this.weatherService.createWeather(this.city)
    this.weatherService.getCurrentWeather(this.city).subscribe(
      res => {
        this.currentWeather = res
        this.city = ""
        this.currentWeather.weather.tempMax = this.kToC(this.currentWeather.weather.tempMax)
        this.currentWeather.weather.tempMin = this.kToC(this.currentWeather.weather.tempMin)
        this.currentWeather.weather.temp = this.kToC(this.currentWeather.weather.temp)
      },
      error => {
        this.toastrService.error("City not found!")
      }
    )
  }

  capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  
  changeUnit() {
    if (this.isC == true) {
      this.currentWeather.weather.tempMax = this.fToC(this.currentWeather.weather.tempMax)
      this.currentWeather.weather.tempMin = this.fToC(this.currentWeather.weather.tempMin)
      this.currentWeather.weather.temp = this.fToC(this.currentWeather.weather.temp)
      this.unit = "°C";
    } else {
      this.currentWeather.weather.tempMax = this.cToF(this.currentWeather.weather.tempMax)
      this.currentWeather.weather.tempMin = this.cToF(this.currentWeather.weather.tempMin)
      this.currentWeather.weather.temp = this.cToF(this.currentWeather.weather.temp)
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

  fToC(temp: number): number {
    return (temp-32)/1.8
  }

  cToF(temp: number): number {
    return (temp)*1.8 + 32;
  }

  openXl(content: any) {
    this.getWeatherHistory();
    this.modalService.open(content, { size: 'xl' });
  }

getWeatherHistory() {
    this.from = this.generateDatabaseDateTime(new Date(this.from))
    this.to = this.generateDatabaseDateTime(new Date(this.to))
    this.weatherService.getHistoricalWeather(this.from, this.to).subscribe(
      res => {
        console.log(this.weatherHistories)
        this.weatherHistories = res
      }
    )
  }

  generateDatabaseDateTime(date: Date): string {
    return date.toISOString().replace("T"," ").substring(0, 19);
  }
    
  deleteAll() {
    this.weatherService.deleteHistoricalWeather(this.from, this.to)
    this.weatherHistories = [];
    this.toastrService.success("Successfull!")
  }
}
