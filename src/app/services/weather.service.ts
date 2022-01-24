import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { CurrentWeatherDTO } from "../dtos/current-weather.dto";
import { WeatherDTO } from "../dtos/weather.dto";

const endpoint = "api/weather"

@Injectable({ providedIn: "root" })
export class WeatherService {
    constructor (private httpClient: HttpClient) {

    }

    getCurrentWeather(city: string): Observable<CurrentWeatherDTO> {
        return this.httpClient.get<CurrentWeatherDTO>(endpoint, {params: {
            city: city
        }})
    }

    createWeather(city: string): Observable<CurrentWeatherDTO> {
        return this.httpClient.post<CurrentWeatherDTO>(endpoint, city)
    }

    getHistoricalWeather(from: string, to: string): Observable<WeatherDTO[]> {
        return this.httpClient.get<WeatherDTO[]>(endpoint + '/getHistoricalWeather', {params: {
            from: from,
            to: to
        }})
    }

    deleteHistoricalWeather(from: string, to: string): Observable<void> {
        return this.httpClient.delete<void>(endpoint+"/deleteHistoricalWeather", {params: {
            from: from,
            to: to
        }})
    }

    updateHistoricalWeather(weatherDTO: WeatherDTO, id: number): Observable<void> {
        return this.httpClient.put<void>(endpoint + "/updateHistoricalWeather", weatherDTO, {params: {
            id: id
        }})
    }
}