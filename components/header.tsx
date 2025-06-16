"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "./logo";
import { useDataContext } from "@/lib/DataContext";
import { useRouter, usePathname } from "next/navigation";

export default function Header() {
  const { setDept } = useDataContext();
  const departments = ["CSE", "ECE", "IT"];
  const schemes = ["2020","2019"];
  const [scheme, setScheme] = useState<string>(schemes[0]);
  const pathname = usePathname();
  const router = useRouter();

  // Get selected department from path (e.g., /notes/cse)
  const selectedDept =
    pathname.endsWith("/cse")
      ? "CSE"
      : pathname.endsWith("/ece")
        ? "ECE"
        : pathname.endsWith("/it")
          ? "IT"
          : "";

  useEffect(() => {
    if (selectedDept) setDept(selectedDept);
  }, [selectedDept, setDept]);

  // Home page
  const isHome = pathname === "/";
  // Department selection page (e.g., /notes)
  const isDeptSelection = pathname === "/notes";

  const handleDeptSelect = (dept: string) => {
    setDept(dept);
    localStorage.setItem("dept", dept);
    router.push(`/${dept.toLowerCase()}`);
  };

  // Order: selected department first, then others
  const orderedDepartments = selectedDept
    ? [selectedDept, ...departments.filter((d) => d !== selectedDept)]
    : departments;

  return (
    <div className="w-full px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center text-white absolute top-0 left-0 z-10">
      <Link href={"/"}>
        <Logo className="text-xl sm:text-xl" />
      </Link>
      {/* Home page: show scheme dropdown */}
      {isHome && (
        <div className="flex items-center gap-2">
          <span className="text-md mr-0 sm:mr-2 font-bold">Scheme</span>
          <div className="relative">
            <select
              value={scheme}
              onChange={(e) => setScheme(e.target.value)}
              className="bg-black/60 border border-gray-500 rounded-md pl-2 pr-8 py-1 text-white appearance-none"
            >
              {schemes.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {/* Custom arrow */}
            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
              <svg
                className="w-4 h-4 text-gray-300"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Department selection page: show selected scheme */}
      {isDeptSelection && (
        <div className="text-base sm:text-lg font-medium">
          Scheme: <span className="font-bold">{scheme}</span>
        </div>
      )}

      {/* All other pages: show department dropdown */}
      {!isHome && !isDeptSelection && (
        <div className="flex items-center relative">
          <span className="hidden md:block text-md font-bold mr-2">Department</span>
          <div className="relative">
            <select
              value={selectedDept}
              onChange={(e) => handleDeptSelect(e.target.value)}
              className="bg-black/60 border border-gray-500 rounded-md pl-2 pr-4 py-1 text-white appearance-none"
            >
              <option value="">Select</option>
              {orderedDepartments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            {/* Custom arrow */}
            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
              <svg
                className="w-4 h-4 text-gray-300"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}