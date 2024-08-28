import supertest from "supertest";

describe("recive a image from the user and return the code", () =>{
    it("should return the client code"), async() => {
        const {body, status} = await supertest(app).post("/upload");
        expect(status).toBe(200);
        expect(body).toBe([{
            
        }])
    }
})