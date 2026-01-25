"use client";

import { useI18n } from "@/hooks/useI18n";

export function Team() {
  const { t } = useI18n();

  const teamMembers = [
    {
      name: "Dhruv Patel",
      role: t("about.teamLeader"),
      image: "👨‍💻",
      color: "from-blue-500 to-cyan-500"
    },
    {
      name: "Sanjarkhan Kalyani",
      role: t("about.teamMember"),
      image: "👨‍💻",
      color: "from-purple-500 to-pink-500"
    },
    {
      name: "Prajawal Yadav",
      role: t("about.teamMember"),
      image: "👨‍💻",
      color: "from-orange-500 to-red-500"
    },
    {
      name: "Vasu Patil",
      role: t("about.teamMember"),
      image: "👨‍💻",
      color: "from-green-500 to-teal-500"
    }
  ];

  return (
    <section className="py-20 px-4 gradient-hero">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-white">
            {t("about.teamTitle2")}
          </h2>
          <p className="text-2xl sm:text-3xl font-bold text-orange-400 mb-4">
            FutureMinds
          </p>
          <p className="text-lg sm:text-xl text-white/90 max-w-3xl mx-auto">
            {t("about.teamSubtitle2")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {teamMembers.map((member, index) => (
            <div key={index} className="glass-card p-6 text-center hover:scale-105 transition-transform duration-300">
              <div className={`w-24 h-24 bg-gradient-to-br ${member.color} rounded-full flex items-center justify-center mx-auto mb-4 text-5xl shadow-lg`}>
                {member.image}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{member.name}</h3>
              <p className="text-white/80 text-sm mb-3">{member.role}</p>
              <div className="w-12 h-1 bg-gradient-to-r from-orange-400 to-orange-600 mx-auto rounded-full"></div>
            </div>
          ))}
        </div>

        {/* College Info */}
        <div className="glass-card p-8 text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">{t("about.collegeTitle")}</h3>
          <p className="text-xl text-white/90">{t("about.collegeName")}</p>
        </div>
      </div>
    </section>
  );
}
