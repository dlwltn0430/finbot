import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';

import { responseMock } from '@/mock/mock';


export const ChatbotResponseRenderer = () => {
  return (
    <div className="max-w-[688px] w-full mx-auto mt-6 bg-yellow-200">
      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={30}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
      >
        {responseMock.content.products.map((product: any, index: number) => (
          <SwiperSlide key={index}>
            <div className="rounded-[12px] border border-[#EFEFEF] bg-white px-[32px] py-[36px]">
              <p className="text-gray5 mb-[16px] font-[600]">{product.description}</p>
              <div className="text-[32px] font-[600] text-[#242525] flex items-center gap-[4px]">
                {/* <img src={tagIcon} alt="tag" className="w-[40px] h-[40px]" /> */}
                {`상품명 상품명 상품명`}
              </div>
              <p className="text-[#515354] text-[16px] font-[500] mt-[4px] mb-[24px]">{product.company}</p>
              <div className="flex gap-[12px] mb-[12px]">
                {product.options.map((opt: any, i: number) => (
                  <div key={i} className="font-[600] flex items-center ">
                    <span className="text-[#B2B4B7] text-[12px] mr-1">{opt.category}</span>
                    <span className="text-main text-[24px]">{opt.value}</span>
                  </div>
                ))}
              </div>

              <div className="bg-[#F3F6F8] px-[12px] py-[20px] text-[16px] text-[#242525] rounded-[8px] leading-[24px] font-[400]">
                <p className=" mb-[16px]">
                  {product.details}
                </p>
                <p className="font-[700]">
                  저축금액
                </p>
                <p>
                  월 1천원 ~ 30만원(단, 신규금액만 0원이상) <br />※ 단, ‘장병내일준비적금’의 금융기관 합산 저축한도는 고객별 월 55만원이며,
                  <br />동 저축한도를 초과하지 않는 범위 내에서 한 은행의 월 저축한도는 최고 30만원까지 설정 및 입금 가능
                </p>
              </div>
              <div className="flex gap-[8px] mt-[24px]">
                {product.tags.map((tag: string, i: number) => (
                  <span
                    key={i}
                    className="px-[12px] py-[8px] border border-main text-[#4D4D4D] rounded-[24px] font-[600] bg-[#FCFCFC]"
                  >
                    💶 {tag}
                  </span>
                ))}

              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};
