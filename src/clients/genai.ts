import {AxiosStatic} from "axios";

export class Genai {
    constructor(protected request: AxiosStatic){
        
    }

    public async fetchMeasure(image: String): Promise<{}>{
        return Promise.resolve({});

    }
}