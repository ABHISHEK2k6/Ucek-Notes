"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSubjectSlug, subjectMap } from "@/lib/utils";
import { IoSearchSharp } from "react-icons/io5";
import { AiOutlineLoading } from "react-icons/ai";
import { getModule } from "@/lib/data";
import { useDataContext } from "@/lib/DataContext";

export default function Page({ params }: { params: { dept: string } }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [recentModules, setRecentModules] = useState<
    { module: string; subject: string; sem: string; dept: string; url: string }[]
  >([]);
  const [errorMsg, setErrorMsg] = useState<string>();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { db, dept } = useDataContext();

  // Load recent modules from localStorage on initial render
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const recent = JSON.parse(localStorage.getItem("recent-modules") || "[]");
        setRecentModules(recent.slice(0, 5));
      } catch {
        setRecentModules([]);
      }
    }
  }, []);

  function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setErrorMsg(undefined);

    // Advanced search logic
    const parts = searchQuery
      .toLowerCase()
      .split(/[\s,]+/)
      .filter(Boolean);

    let sem, module_, subject;

    const getStandardSubject = (word: string) => {
      for (const [standard, variants] of Object.entries(subjectMap)) {
        if (variants.includes(word)) {
          return standard;
        }
      }
      return word; // fallback to original if no match
    };

    for (const part of parts) {
      if (/^(s|sem)[-]?\d+$/i.test(part)) {
        const match = part.match(/\d+/);
        if (match) sem = match[0];
      } else if (/^m(od(ule)?)?-?\d+$/i.test(part)) {
        const match = part.match(/\d+/);
        if (match) module_ = match[0];
      } else if (!subject) {
        subject = getStandardSubject(part);
      }
    }

    // Condition: If only subject is provided
    if (!sem && !module_ && subject !== undefined) {
      const r1 = db?.query({
        where: {
          Department: dept?.toUpperCase(),
          Subject: subject.toUpperCase(),
        }
      });

      const r2 = db?.query({
        where: {
          Subject: subject.toUpperCase(),
        },
      });

      const result = r1?.length === 0 ? r2 : r1;

      if (result && result.length > 0) {
        setLoading(false);
        router.push(`/${result[0].Department}/${result[0].Semester}/${getSubjectSlug(result[0].Subject)}`);
        return;
      }
    }

    if (!sem || !subject || !module_) {
      setLoading(false);
      setErrorMsg(
        "Please provide a valid search query in the format: semester, subject, module (e.g., 's2, chem, mod1')"
      );
      return;
    }

    const response = getModule(dept, sem, subject, module_);
    response
      .then((data: any[]) => {
        setLoading(false);
        if (!Array.isArray(data) || data.length === 0 || !Array.isArray(data[0]) || !data[0][0]) {
          setErrorMsg(
            `No data found for ${dept} - Semester ${sem}, Subject: ${subject}, Module: ${module_}`
          );
          return;
        }
        setErrorMsg("");
        window.open(data[0][0], "_blank");
      })
      .catch(() => {
        setLoading(false);
        setErrorMsg("An error occurred while searching. Please try again.");
      });
  }

  return (
    <div className="bg-cover bg-center px-4 md:pt-40 flex flex-col items-center pt-32 -mt-12">
      <form onSubmit={handleSearch} className="w-full max-w-2xl mb-10">
        <div className="bg-black/40 p-4 rounded-2xl flex items-center backdrop-blur-md">
          <input
            placeholder="Search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-grow bg-transparent text-white outline-none px-4 text-lg placeholder-white"
          />
          {!loading ? (
            <button className="px-3" type="submit">
              <IoSearchSharp size={24} />
            </button>
          ) : (
            <button className="px-3 cursor-not-allowed opacity-50" type="button" disabled>
              <AiOutlineLoading size={24} className="animate-spin" />
            </button>
          )}
        </div>
        {errorMsg && (
          <div className="mt-2 text-center bg-black p-2 px-3 rounded-lg mx-2">
            <p className="text-red-600 text-xs sm:text-sm">{errorMsg}</p>
          </div>
        )}
      </form>

      <div className="grid grid-cols-3 gap-4 w-full max-w-2xl mb-12">
        {["Question Paper", "Notes", "Syllabus"].map((item) =>
          item === "Notes" ? (
            <Link
              key={item}
              href="/notes"
              className="bg-black/30 hover:bg-black/60 transition text-white text-lg font-semibold md:px-6 py-3 rounded-xl backdrop-blur-md shadow-md w-full flex items-center justify-center"
            >
              {item}
            </Link>
          ) : (
            <button
              key={item}
              className="bg-black/30 text-white text-lg font-semibold md:px-6 py-3 rounded-xl backdrop-blur-md shadow-md w-full"
            >
              {item}
            </button>
          )
        )}
      </div>

      <div className="w-full max-w-2xl text-white">
        <p className="text-base font-semibold mb-4">RECENT</p>
        <div
          className="flex flex-col gap-4 overflow-y-auto max-h-72 pr-2 no-scrollbar"
        >
          {recentModules.length === 0 ? (
            <div className="bg-black/50 px-6 py-4 rounded-xl flex justify-between items-center backdrop-blur-[.17rem] text-lg text-gray-400">
              No recent modules viewed.
            </div>
          ) : (
            recentModules.slice(0, 5).map((mod) => (
              <Link
                key={mod.url}
                href={mod.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-black/50 px-6 py-3 sm:py-3 rounded-xl flex justify-between items-center backdrop-blur-[.17rem] hover:bg-black/70 transition group"
              >
                <div>
                  <div className="text-md sm:text-lg font-bold capitalize">
                    {mod.subject} - {mod.module}
                  </div>
                  <div className="text-sm text-gray-300 mt-1 uppercase">
                    {mod.dept} | Sem {mod.sem}
                  </div>
                </div>
                <span className="ml-4 text-2xl text-gray-400 group-hover:text-white transition">
                  &gt;
                </span>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}