import { IsEmail, IsString, Matches, MaxLength, MinLength } from "class-validator"


export class LoginUserDto {

    @IsString()
    @IsEmail()
    email: string


    @IsString()
    @MinLength(6)
    @MaxLength(50)
    // Patron para que se cumpla una serie de restricciones al crear la contraseña
    password: string;

}