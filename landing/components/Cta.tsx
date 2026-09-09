import React from 'react';
import { ArrowRight } from 'lucide-react';
import { GithubIcon } from './GithubIcon';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.medev.mrsgemaseny.com';

export const Cta = () => {
  return (
    <section className="relative overflow-hidden border-b border-[#30363d] bg-[#0d1117] py-16 sm:py-28 lg:py-36">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-[#f0f6fc] sm:text-5xl lg:text-6xl break-words">
          Готов попробовать?
        </h2>
        <p className="mt-4 sm:mt-6 text-base sm:text-xl leading-relaxed text-[#c9d1d9]">
          Зарегистрируйся бесплатно — резюме будет готово через 2 минуты.
        </p>

        <div className="mt-8 sm:mt-10 flex justify-center w-full">
          <a
            href={`${APP_URL}/login`}
            aria-label="Зарегистрироваться или войти через GitHub"
            className="flex w-full sm:w-auto items-center justify-center gap-3 rounded-xl bg-[#238636] px-6 sm:px-10 py-4 sm:py-5 text-base sm:text-lg font-bold text-white shadow-xl transition-all hover:bg-[#2ea043] focus-visible:ring-2 focus-visible:ring-[#2ea043] focus-visible:outline-none min-h-[44px]"
          >
            <GithubIcon className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" />
            <span>Войти через GitHub</span>
            <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
};
