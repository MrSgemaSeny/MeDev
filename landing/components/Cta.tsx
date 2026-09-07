import React from 'react';
import { ArrowRight } from 'lucide-react';
import { GithubIcon } from './GithubIcon';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.medev.mrsgemaseny.com';

export const Cta = () => {
  return (
    <section className="relative overflow-hidden border-b border-[#30363d] bg-[#0d1117] py-28 sm:py-36">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl font-extrabold tracking-tight text-[#f0f6fc] sm:text-6xl">
          Готов попробовать?
        </h2>
        <p className="mt-6 text-xl leading-relaxed text-[#c9d1d9] sm:text-2xl">
          Зарегистрируйся бесплатно — резюме будет готово через 2 минуты.
        </p>

        <div className="mt-10 flex justify-center">
          <a
            href={`${APP_URL}/login`}
            className="flex items-center gap-3 rounded-xl bg-[#238636] px-10 py-5 text-lg font-bold text-white shadow-xl transition-all hover:bg-[#2ea043] focus-visible:outline-2 focus-visible:outline-[#238636]"
          >
            <GithubIcon className="h-6 w-6" />
            <span>Войти через GitHub</span>
            <ArrowRight className="h-6 w-6" />
          </a>
        </div>
      </div>
    </section>
  );
};
