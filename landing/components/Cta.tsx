import React from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { GithubIcon } from './GithubIcon';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.medev.mrsgemaseny.com';

export const Cta = () => {
  return (
    <section className="relative overflow-hidden border-b border-[#30363d] bg-[#0d1117] py-20 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-[#f0f6fc] sm:text-4xl">
          Готов попробовать?
        </h2>
        <p className="mt-4 text-base text-[#8b949e]">
          Зарегистрируйся бесплатно — резюме будет готово через 2 минуты.
        </p>

        <div className="mt-8 flex justify-center">
          <a
            href={`${APP_URL}/login`}
            className="flex items-center gap-2 rounded-md bg-[#238636] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#2ea043] focus-visible:outline-2 focus-visible:outline-[#238636]"
          >
            <GithubIcon className="h-4 w-4" />
            <span>Войти через GitHub</span>
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-[#8b949e]">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#2ea043]" />
            <span>Бесплатно</span>
          </div>
          <span>·</span>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#2ea043]" />
            <span>Без карты</span>
          </div>
          <span>·</span>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#2ea043]" />
            <span>Отмена в любой момент</span>
          </div>
        </div>
      </div>
    </section>
  );
};
