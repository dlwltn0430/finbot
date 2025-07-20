import ReactMarkdown from 'react-markdown';
import { institutionImages } from '@/constants/institutionImages';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import { Product } from '@/api/chat';

import leftArrow from '@/assets/chat/left-arrow.svg';
import leftArrowHover from '@/assets/chat/left-arrow-hover.svg';
import rightArrow from '@/assets/chat/right-arrow.svg';
import rightArrowHover from '@/assets/chat/right-arrow-hover.svg';
import { useState } from 'react';

interface ProductProps {
  products: Product[];
}

export const ChatbotResponseRenderer = ({ products }: ProductProps) => {
  const [hoveredItem, setHoveredItem] = useState<'left' | 'right' | null>(null);

  return (
    <div className="relative mx-auto mt-6 w-[800px]">
      <button
        className="custom-prev left-0px absolute top-1/2 z-10 -translate-y-1/2"
        onMouseEnter={() => setHoveredItem('left')}
        onMouseLeave={() => setHoveredItem(null)}
      >
        <img
          src={hoveredItem === 'left' ? leftArrowHover : leftArrow}
          alt="이전"
        />
      </button>
      <button
        className="custom-next absolute right-0 top-1/2 z-10 -translate-y-1/2"
        onMouseEnter={() => setHoveredItem('right')}
        onMouseLeave={() => setHoveredItem(null)}
      >
        <img
          src={hoveredItem === 'right' ? rightArrowHover : rightArrow}
          alt="다음"
        />
      </button>

      <div className="mx-auto w-[688px]">
        <Swiper
          modules={[Navigation, Pagination]}
          slidesPerView={1}
          navigation={{
            nextEl: '.custom-next',
            prevEl: '.custom-prev',
          }}
          pagination={{
            clickable: true,
            el: '.custom-pagination',
            bulletClass: 'custom-bullet',
          }}
        >
          {products.map((product, index) => (
            <SwiperSlide key={index}>
              <div className="rounded-[12px] border border-[#EFEFEF] bg-white px-[32px] py-[36px] h-fit">
                <p className="mb-[8px] font-[600] text-gray5 text-[16px]">
                  {product.description}
                </p>
                <div className="flex items-center gap-[12px] text-[32px] font-[700] text-[#242525]">
                  <img
                    src={
                      product.institution
                        ? institutionImages[product.institution]
                        : institutionImages['default']
                    }
                    className="h-[36px] w-[36px]"
                  />
                  {product.name}
                </div>
                <p className="mb-[16px] mt-[8px] text-[12px] font-[500] text-[#515354]">
                  {product.institution}
                </p>
                <div className="mb-[16px] flex gap-[16px]">
                  {product.options?.map((opt, i) => (
                    <div key={i} className="flex items-center font-[600]">
                      <span className="mr-2 text-[12px] text-[#B2B4B7]">
                        {opt.category}
                      </span>
                      <span className="text-[24px] font-[600] text-main">{opt.value}</span>
                    </div>
                  ))}
                </div>

                <div className="rounded-[8px] bg-[#F3F6F8] px-[16px] py-[16px] text-[16px] font-[400] leading-[24px] text-[#242525] h-[196px]">
                  <div className="prose h-full max-h-full min-w-full scrollbar-hide [&::-webkit-scrollbar]:[width:8px] [&::-webkit-scrollbar-thumb]:[background-color:lightgray] [&::-webkit-scrollbar-thumb]:[border-radius:8px] [&::-webkit-scrollbar-thumb]:[bg-none] overflow-y-auto">
                    <ReactMarkdown components={{
                      li: (props) => (
                        <li className='mt-[2px] ml-[-4px] mb-[0]' {...props} />
                      ),
                      ul: (props) => (
                        <ul className='mt-[0px] mb-[0]' {...props} />
                      )
                    }}>{product.details || ''}</ReactMarkdown>
                  </div>

                  {/* <p className="font-[700]">저축금액</p>
                  <p>
                    월 1천원 ~ 30만원(단, 신규금액만 0원이상) <br />※ 단,
                    ‘장병내일준비적금’의 금융기관 합산 저축한도는 고객별 월
                    55만원이며,
                    <br />동 저축한도를 초과하지 않는 범위 내에서 한 은행의 월
                    저축한도는 최고 30만원까지 설정 및 입금 가능
                  </p> */}
                </div>
                {(product.tags?.length ?? 0) > 0 && 
                  <div className="mt-[24px] flex gap-[8px]">
                    {product.tags?.map((tag: string, i: number) => (
                      <span
                        key={i}
                        className="rounded-[24px] border border-main bg-[#FCFCFC] px-[12px] py-[8px] font-[600] text-[#4D4D4D]"
                      >
                        💰 {tag}
                      </span>
                    ))}
                  </div>
                }
              </div>
            </SwiperSlide>
          ))}

          <div className="custom-pagination mt-[32px] flex justify-center gap-[8px]" />
        </Swiper>
      </div>
    </div>
  );
};
