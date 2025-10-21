export interface Author {
  id: string;
  name: string;
  email?: string;
  image: {
    url: string;
    height: number;
    width: number;
  };
}
