"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from 'react';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { SHEET_ID } from './data';
import Papa from 'papaparse';
import { CSQL } from './csql';
import Loading from '@/app/loading';

type DataContextType = {
    db: CSQL | undefined;
    setDb: React.Dispatch<React.SetStateAction<any>>;
    dept: string;
    setDept: React.Dispatch<React.SetStateAction<string>>;
    scheme: string;
    setScheme: React.Dispatch<React.SetStateAction<string>>;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
    const [db, setDb] = useState<CSQL>();
    const [dept, setDept] = useState<string>(''); // You can set a default value here if you want
    const [scheme, setScheme] = useState<string>('2019'); // or your default

    useEffect(() => {
        Papa.parse(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=notes`, {
            download: true,
            header: true,
            complete: (results) => {
                if (results.errors.length > 0) {
                    console.error('Error loading database:', results.errors);
                } else {
                    // Optionally, set dept from localStorage or leave as is
                    const cachedDept = localStorage.getItem('dept');
                    if (cachedDept) {
                        setDept(cachedDept);
                    }
                    setDb(new CSQL(results.data));
                }
            },
            error: (error) => {
                console.error('Error parsing CSV:', error);
            }
        });
    }, []);

    useEffect(() => {
        if (dept) {
            localStorage.setItem('dept', dept);
        }
    }, [dept]);

    return (
        <DataContext.Provider value={{ db, setDb, dept, setDept, scheme, setScheme }}>
            {db ? children : <Loading msg="Getting your notes..." />}
        </DataContext.Provider>
    );
};

export const useDataContext = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useDataContext must be used within a DataProvider');
    }
    return context;
};