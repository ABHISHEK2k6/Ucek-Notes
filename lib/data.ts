import Papa from "papaparse";

export const SHEET_ID = "1F-6sChzjRI85AsLV2FQACXTX17PN9iud6Ecxnn0wJC4";
export const GITHUB_API_URL = "https://api.github.com/repos/mulearnucek/notes/contributors";

export function getData(url: string): Promise<string[][]> {
  return new Promise((resolve, reject) => {
    Papa.parse<string[]>(url, {
      download: true,
      skipEmptyLines: true,
      complete(results) {
        const d = results.data;
        d.shift(); // Remove header row
        resolve(d);
      },
      error(error) {
        reject(error);
      }
    });
  });
}

export async function getModule(dept: string, sem: string, subject: string, module: string) {  
  const query = `SELECT G WHERE C = '${dept.toUpperCase()}' AND D = ${sem} AND E = '${subject.toUpperCase()}' AND F = ${module}`;
  
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=notes&tq=` +
    encodeURIComponent(query);
  
  try {
    return await getData(url);
  } catch (error) {
    console.error("Fetch failed:", error); 
    return [];
  }
}

export function getSubjects(dept: string, sem: string) {
  const url =
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=notes&tq=` +
    encodeURIComponent(
      `SELECT E, COUNT(E) WHERE C = '${dept.toUpperCase()}' AND D = ${sem} GROUP BY E ORDER BY E`
    );

  return getData(url)
    .then(data => {
      if (data.length === 0) return [];
      return data.flatMap(row => row[0]);
    })
    .catch(error => {
      console.error("Fetch failed:", error);
      return [];
    });
}

export type Note = {
  Module: string;
  Subject: string;
  File: string;
  Title: string;
  Scheme?: string;
};