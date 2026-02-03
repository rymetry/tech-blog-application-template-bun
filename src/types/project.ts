export type Project = {
  id: string;
  name: string;
  summary: string;
  tags: string[];
  role: string;
  stack: string[];
  impact: string[];
  links: {
    github?: string;
    demo?: string;
    writeup?: string;
  };
};

