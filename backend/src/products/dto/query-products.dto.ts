import { IsOptional, IsUUID, IsNumberString, IsString, IsIn } from 'class-validator';

export class QueryProductsDto {
  @IsOptional() @IsNumberString() page?: string;
  @IsOptional() @IsNumberString() limit?: string;
  @IsOptional() @IsUUID() categoryId?: string;
  @IsOptional() @IsNumberString() minPrice?: string;
  @IsOptional() @IsNumberString() maxPrice?: string;
  @IsOptional() @IsString() color?: string;
  @IsOptional() @IsIn(['price_asc', 'price_desc', 'newest']) sort?: string;
  @IsOptional() @IsString() slug?: string;
}
