import { CityDTO } from "./city.dto";

export type WeatherDTO = {
    id: number,
    date: Date,
    temp: number,
    tempMin: number,
    tempMax: number,
    pressure: number,
    humidity: number,
    city: CityDTO
}