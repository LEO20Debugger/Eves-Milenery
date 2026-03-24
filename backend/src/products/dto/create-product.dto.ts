import { IsString, IsNotEmpty, IsNumber, IsPositive, IsUUID, IsInt, Min, IsArray, ArrayMinSize, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString() @IsNotEmpty() name: string;
  @IsOptional() @IsString() description?: string;
  @IsNumber({ maxDecimalPlaces: 2 }) @IsPositive() @Type(() => Number) price: number;
  @IsInt() @Min(0) @Type(() => Number) stock: number;
  @IsInt() @Min(0) @Type(() => Number) initialStock: number;
  @IsUUID() categoryId: string;
  @IsArray() @ArrayMinSize(1) images: string[];
  @IsOptional() @IsString() color?: string;
}
