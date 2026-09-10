import React from 'react';
import { ArrowRight } from 'lucide-react';
import { GithubIcon } from './GithubIcon';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.medev.mrsgemaseny.com';

export const Cta = () => {
  return (
    <section className="relative overflow-hidden border-b border-[#30363d] bg-[#0d1117] py-10 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-4xl px-3.5 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl font-extrabold tracking-tight text-[#f0f6fc] sm:text-5xl lg:text-6xl break-words">
          Готов попробовать?
        </h2>
        <p className="mt-2.5 sm:mt-5 text-xs sm:text-xl leading-relaxed text-[#c9d1d9]">
          Зарегистрируйся бесплатно — резюме будет готово через 2 минуты.
        </p>

        <div className="mt-6 sm:mt-10 flex justify-center w-full">
          <a
            href={`${APP_URL}/login`}
            aria-label="Зарегистрироваться или войти через GitHub"
            className="flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-lg sm:rounded-xl bg-[#238636] px-5 sm:px-10 py-2.5 sm:py-4 text-sm sm:text-lg font-bold text-white shadow-xl transition-all hover:bg-[#2ea043] focus-visible:ring-2 focus-visible:ring-[#2ea043] focus-visible:outline-none min-h-[40px] sm:min-h-[44px]"
          >
            <GithubIcon className="h-4.5 w-4.5 sm:h-6 sm:w-6 shrink-0" />
            <span>Войти через GitHub</span>
            <ArrowRight className="h-4 w-4 sm:h-6 sm:w-6 shrink-0" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
};
