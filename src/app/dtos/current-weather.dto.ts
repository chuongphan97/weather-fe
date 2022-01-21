import { CityDTO } from "./city.dto";
import { WeatherDescModelDTO } from "./weather-desc-model.dto";
import { WeatherDTO } from "./weather.dto";

export type CurrentWeatherDTO = {
    city: CityDTO,
    weather: WeatherDTO,
    weatherDescModels: WeatherDescModelDTO[]
}