import React from "react";

interface SoccerIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  strokeColor?: string;
  color?: string;
}

export const SoccerBallIcon: React.FC<SoccerIconProps> = ({
  size = 64,
  color = "#4a4e51",
  className,
  ...props
}) => {
  return (
    <svg
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      aria-hidden="true"
      role="img"
      width={size}
      height={size}
      preserveAspectRatio="xMidYMid meet"
      className={className}
      {...props}
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0" />
      <g
        id="SVGRepo_tracerCarrier"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <g id="SVGRepo_iconCarrier">
        <circle cx="32" cy="32" fill="#ffffff" r="29.3" />
        <path
          d="M61.9 32c0-.7.2-10.9-5.8-17.5c-.3-.6-1.5-3-5.6-5.9C47.8 6.5 45 5 44.7 4.8C44.4 4.6 39.4 2 33.4 2c-.5 0-.9 0-1.4.1c-4.6-.1-8.8 1.1-11.9 2.5c-3.2 1.4-5.3 2.8-5.5 3c-3.4 1.9-9.9 9.5-10.4 13.6c-2.1 2.6-3.8 14.5 0 21.7c2.7 10 12.7 15 13.5 15.4c.5.3 5.9 3.7 12.6 3.7h.9c.6.1 1.1.1 1.7.1c7.2 0 18-5.1 20.2-9.1c6.2-4.6 9.4-16.2 8.8-21M17.8 47.1c-2.9-4.6-4.5-10.7-4.9-12.1c.9-1.4 5.4-8 7.9-10c1.4.3 7.5 1.4 13.2 2.4c.7 1.9 3.9 10 4.8 13.2c-1 1.2-4.9 5.7-8.7 9.2c-4.1.1-11-2.3-12.3-2.7m36-32.5c0 .4-.1 2-.9 3.9c-1.5-.8-5.3-2.4-10.6-2.7c-.8-1.2-3.8-5.3-8.5-8.1c.6-1.3 1.5-2.8 2.1-3.3c.2 0 .4-.1.8-.1c2.5 0 6.9 1.7 7.3 1.8.4.2 8.3 4.4 9.8 8.5M11.8 34c-3.4-.6-5.5-1.6-6.1-2c-1.3-4.6-.2-9.6-.1-10.3c1.3-2.2 4.8-8 7.2-9.1c2.4-.5 5.5.1 6.7.4c-.1 1.6-.3 6.1.3 10.9c-2.6 2.2-6.9 8.5-8 10.1M31.7 3.5c.8.1 1.9.2 2.7.5c-.8 1-1.6 2.5-1.9 3.3c-1.6.3-7.5 1.4-12.2 4.4c-.9-.2-3.8-.9-6.5-.7c.7-1.3 1.7-2.2 1.8-2.3c.3-.3 7.4-5.3 16.1-5.2m19.1 38.1c-1.2 0-5.7-.3-10.6-1.5c-.9-3.3-4.1-11.4-4.8-13.3c3.1-4.4 6.1-8.5 6.9-9.7c5.7.4 9.7 2.5 10.5 2.9c3.3 5.3 4 10.7 4.1 11.6c-1.8 5.5-5.2 9.2-6.1 10M3.7 28.5c.1 1.3.3 2.6.7 3.9c-.3.9-.6 1.8-.7 2.7c-.3-2.3-.3-4.6 0-6.6M18.5 57l-.4.6l.4-.6c-2.5-1.2-4.4-4-5.2-5.1c1.5-1.5 3.4-2.9 4.1-3.4c1.6.6 8.3 2.8 12.6 2.8c.7 1 3.1 4 6 6.4c-1.8 1.8-4.4 2.6-4.9 2.8c-6.8.2-12.6-3.5-12.6-3.5m16.3 3.4c.9-.5 1.9-1.2 2.7-2.1c1.3-.2 6.9-1.1 11.9-4.8c.3 0 .9.1 1.5.1c-3.1 2.9-10.5 6.2-16.1 6.8M50.2 52c1.8-4.7 1.7-8.3 1.6-9.4c1-1 4.4-4.6 6.3-10.1c1 .2 1.4.4 2 .6c.1.4.3 1.3.2 2.7c-.8 5-3.4 12.6-8.1 15.9c-.5.3-1.3.4-2 .3"
          fill={color}
        />
      </g>
    </svg>
  );
};

export const SoccerPlayerIcon: React.FC<SoccerIconProps> = ({
  size = 15,
  color = "#f8fafc",
  className,
  ...props
}) => {
  return (
    <svg
      viewBox="0 0 15 15"
      version="1.1"
      id="soccer"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill={color}
      stroke={color}
      className={className}
      {...props}
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0" />
      <g
        id="SVGRepo_tracerCarrier"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <g id="SVGRepo_iconCarrier">
        <path d="M11,1.5C11,2.3284,10.3284,3,9.5,3S8,2.3284,8,1.5S8.6716,0,9.5,0S11,0.6716,11,1.5z M11,11c-0.5523,0-1,0.4477-1,1 s0.4477,1,1,1s1-0.4477,1-1S11.5523,11,11,11z M12.84,6.09l-1.91-1.91l0,0C10.8399,4.0675,10.7041,4.0014,10.56,4H3.5 C3.2239,4,3,4.2239,3,4.5S3.2239,5,3.5,5h2.7L3,11.3l0,0c-0.0138,0.066-0.0138,0.134,0,0.2c-0.058,0.2761,0.1189,0.547,0.395,0.605 C3.6711,12.163,3.942,11.9861,4,11.71l0,0L5,10h2l-1.93,4.24l0,0C5.0228,14.3184,4.9986,14.4085,5,14.5 c-0.0552,0.2761,0.1239,0.5448,0.4,0.6c0.2761,0.0552,0.5448-0.1239,0.6-0.4l0,0l4.7-9.38l1.44,1.48 c0.211,0.1782,0.5264,0.1516,0.7046-0.0593C13.0037,6.5523,13.0018,6.2761,12.84,6.09z" />
      </g>
    </svg>
  );
};

export const SoccerPlayerAvatarIcon: React.FC<SoccerIconProps> = ({
  size = 64,
  strokeColor = "#4c241d",
  className,
  ...props
}) => {
  return (
    <svg
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      className={className}
      {...props}
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0" />
      <g
        id="SVGRepo_tracerCarrier"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <g id="SVGRepo_iconCarrier">
        <g id="soccer-player">
          <polyline
            points="1 53 11 42 15 48 4 56"
            fill="#ffe8dc"
            // stroke="#4c241d"
            stroke={strokeColor}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2px"
          />
          <polyline
            points="62 53 52 42 48 48 59 56"
            fill="#ffe8dc"
            // stroke="#4c241d"
            stroke={strokeColor}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2px"
          />
          <polygon
            points="45 33.581 45 47.423 47.751 49.141 54.075 42.954 45 33.581"
            fill="#d6d6d6"
            // stroke="#4c241d"
            stroke={strokeColor}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2px"
          />
          <path
            d="M26.9,27.684a15.489,15.489,0,0,1,9.1,0l2,10.382H24.9Z"
            fill="#ffe8dc"
            // stroke="#4c241d"
            stroke={strokeColor}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2px"
          />
          <polygon
            points="18 33.581 18 47.423 15.249 49.141 8.925 42.954 18 33.581"
            fill="#d6d6d6"
            // stroke="#4c241d"
            stroke={strokeColor}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2px"
          />
          <path
            d="M45,61.891V33.452a48.142,48.142,0,0,0-7.534-1.624,6.049,6.049,0,0,1-12.036-.012A45.372,45.372,0,0,0,18,33.452V61.891"
            fill="#ffffff"
            // stroke="#4c241d"
            stroke={strokeColor}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2px"
          />
          <path
            d="M37.63,27.821l-3.962,1.73a5.456,5.456,0,0,1-4.336,0l-3.962-1.73A7.041,7.041,0,0,1,21,21.434v-8.7C21,7.36,25.7,3,31.5,3h0C37.3,3,42,7.36,42,12.738v8.7A7.041,7.041,0,0,1,37.63,27.821Z"
            fill="#ffe8dc"
            // stroke="#4c241d"
            stroke={strokeColor}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2px"
          />
          <path
            d="M21,22.434a7.041,7.041,0,0,0,4.37,6.387l3.962,2.73a5.456,5.456,0,0,0,4.336,0l3.962-2.73A7.041,7.041,0,0,0,42,22.434v-4a7.041,7.041,0,0,1-4.37,6.387l-3.962,1.73a5.456,5.456,0,0,1-4.336,0l-3.962-1.73A7.041,7.041,0,0,1,21,18.434Z"
            fill="#ffce56"
            // stroke="#4c241d"
            stroke={strokeColor}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2px"
          />
          <path
            d="M42,17h1a2,2,0,0,1,2,2v0a2,2,0,0,1-2,2H42a0,0,0,0,1,0,0V17A0,0,0,0,1,42,17Z"
            fill="#ffe8dc"
            // stroke="#4c241d"
            stroke={strokeColor}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2px"
          />
          <path
            d="M18,17h1a2,2,0,0,1,2,2v0a2,2,0,0,1-2,2H18a0,0,0,0,1,0,0V17a0,0,0,0,1,0,0Z"
            transform="matrix(-1, 0, 0, -1, 39, 38)"
            fill="#ffe8dc"
            // stroke="#4c241d"
            stroke={strokeColor}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2px"
          />
          <path
            d="M23.183,2A2.183,2.183,0,0,0,21,4.183V14a4,4,0,0,0,4-4H37.38A6.62,6.62,0,0,0,44,3.38V2Z"
            fill="#ffce56"
            // stroke="#4c241d"
            stroke={strokeColor}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2px"
          />

          <circle cx="27.017" cy="17.792" r="1.069" fill="#4c241d" />
          <circle cx="36.017" cy="17.792" r="1.069" fill="#4c241d" />

          <polyline
            points="27 25 29 23 34 23 36 25"
            fill="none"
            // stroke="#4c241d"
            stroke={strokeColor}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2px"
          />
          <polyline
            points="27 44 29 43 29 49"
            fill="none"
            // stroke="#4c241d"
            stroke={strokeColor}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2px"
          />
          <polyline
            points="33 44 35 43 35 49"
            fill="none"
            // stroke="#4c241d"
            stroke={strokeColor}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2px"
          />
        </g>
      </g>
    </svg>
  );
};

export const SoccerMedal: React.FC<SoccerIconProps> = ({
  size = 48,
  className,
  ...props
}) => {
  return (
    <svg
      viewBox="0 0 48 48"
      id="svg5"
      version="1.1"
      xmlSpace="preserve"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      width={size}
      height={size}
      className={className}
      {...props}
    >
      <defs id="defs2" />
      <g id="layer1" transform="translate(-26,-305)">
        <path
          d="m 44.000048,328.67941 5.196153,3 L 39.196153,349 38.579267,344.06848 34,346 c 3.333351,-5.77353 6.666699,-11.54706 10.000048,-17.32059 z"
          id="path4783"
          style={{
            color: "#000000",
            fill: "#ff5576",
            fillOpacity: 1,
            fillRule: "evenodd",
            strokeWidth: 2,
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeMiterlimit: 4.1,
          }}
        />
        <path
          d="m 55.999976,328.67941 -5.196153,3 L 60.803871,349 61.420757,344.06848 66.000024,346 c -3.333351,-5.77353 -6.666699,-11.54706 -10.000048,-17.32059 z"
          id="path4789"
          style={{
            color: "#000000",
            fill: "#ff5576",
            fillOpacity: 1,
            fillRule: "evenodd",
            strokeWidth: 2,
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeMiterlimit: 4.1,
          }}
        />
        <path
          d="m 58.61151,332.64671 -1.093909,4.40936 -4.365569,-1.25732 -3.152031,3.27166 -3.152031,-3.27166 -4.365569,1.25732 -1.09391,-4.40936 -4.409356,-1.0939 1.257325,-4.36557 -3.27166,-3.15204 3.27166,-3.15203 -1.257325,-4.36557 4.409356,-1.0939 1.093909,-4.40936 4.365569,1.25732 L 50,309 l 3.152031,3.27166 4.365569,-1.25732 1.09391,4.40936 4.409356,1.0939 -1.257325,4.36557 3.27166,3.15203 -3.27166,3.15204 1.257325,4.36557 z"
          id="path789"
          style={{
            fill: "#e7e7e7",
            fillRule: "evenodd",
            strokeWidth: 2,
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeMiterlimit: 4.1,
          }}
        />
        <path
          d="m 43.720703,313.0625 a 15.136557,15.136557 0 0 0 -1.777344,0.12695 l -0.554687,2.23438 -4.410156,1.09375 1.257812,4.36523 -3.271484,3.15235 3.271484,3.15234 -1.257812,4.36523 4.410156,1.09375 1.09375,4.41016 4.365234,-1.25781 3.152344,3.27148 3.152344,-3.27148 3.076172,0.88672 a 15.136557,15.136557 0 0 0 2.628906,-8.48633 15.136557,15.136557 0 0 0 -15.136719,-15.13672 z"
          id="path5647"
          style={{
            fill: "#fafafa",
            fillOpacity: 1,
            fillRule: "evenodd",
            stroke: "none",
            strokeWidth: 2,
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeMiterlimit: 4.1,
            strokeOpacity: 1,
          }}
        />
        <path
          d="m 57.99999,324.03521 c 0,4.41826 -3.58171,7.99998 -7.99998,7.99998 -4.41828,0 -8,-3.58172 -8,-7.99998 0,-4.41827 3.58172,-8 8,-8 4.41827,0 7.99998,3.58173 7.99998,8 z"
          id="path1540"
          style={{
            fill: "#f2a50c",
            fillOpacity: 1,
            fillRule: "evenodd",
            stroke: "none",
            strokeWidth: 2,
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeMiterlimit: 4.1,
            strokeOpacity: 1,
          }}
        />
        <path
          d="M 48.648438,316.15039 C 44.874149,316.79295 42,320.07779 42,324.03516 c 0,3.95735 2.874149,7.2422 6.648438,7.88476 3.773341,-0.64334 6.646484,-3.92807 6.646484,-7.88476 0,-3.9567 -2.873143,-7.24143 -6.646484,-7.88477 z"
          id="path8683"
          style={{
            fill: "#fcca3d",
            fillOpacity: 1,
            fillRule: "evenodd",
            stroke: "none",
            strokeWidth: 2,
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeMiterlimit: 4.1,
            strokeOpacity: 1,
          }}
        />
        <path
          d="m 50,317.77344 a 1.0057675,0.9942576 0 0 0 -1.005859,0.99609 v 0.86328 c -1.090652,0.39441 -1.894531,1.40627 -1.894531,2.60938 0,1.55135 1.333807,2.78711 2.90039,2.78711 0.52508,0 0.888672,0.36923 0.888672,0.79882 -10e-7,0.42962 -0.363602,0.79883 -0.888672,0.79883 -0.525074,0 -0.886718,-0.36921 -0.886719,-0.79883 a 1.0057675,0.9942576 0 0 0 -1.005859,-0.99413 1.0057675,0.9942576 0 0 0 -1.007812,0.99413 c 1e-6,1.20312 0.803877,2.21497 1.894531,2.60938 v 0.86328 A 1.0057675,0.9942576 0 0 0 50,330.29687 a 1.0057675,0.9942576 0 0 0 1.005859,-0.99609 v -0.86328 c 1.090653,-0.39441 1.894528,-1.40626 1.894531,-2.60938 0,-1.55134 -1.333808,-2.7871 -2.90039,-2.7871 -0.525083,0 -0.886719,-0.36921 -0.886719,-0.79883 0,-0.42961 0.36163,-0.79883 0.886719,-0.79883 0.525084,0 0.888672,0.36922 0.888672,0.79883 a 1.0057675,0.9942576 0 0 0 1.005859,0.99414 1.0057675,0.9942576 0 0 0 1.005859,-0.99414 c 0,-1.20312 -0.803879,-2.21497 -1.894531,-2.60938 v -0.86328 A 1.0057675,0.9942576 0 0 0 50,317.77344 Z"
          id="path4072"
          style={{
            color: "#000000",
            fill: "#808b9b",
            fillOpacity: 1,
            fillRule: "evenodd",
            stroke: "none",
            strokeWidth: 0.999996,
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeMiterlimit: 4.1,
            strokeOpacity: 1,
          }}
        />
      </g>
    </svg>
  );
};

export const SoccerScore: React.FC<SoccerIconProps> = ({
  size = 64,
  color,
  className,
  ...props
}) => {
  return (
    <svg
      height={size}
      width={size}
      version="1.1"
      id="Layer_1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 512 512"
      xmlSpace="preserve"
      className={className}
      {...props}
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0" />
      <g
        id="SVGRepo_tracerCarrier"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <g id="SVGRepo_iconCarrier">
        {/* Base do troféu - parte dourada superior */}
        <path
          style={{ fill: "#FFE49C" }}
          d="M489.107,94.226H256H22.893C10.256,94.226,0,104.482,0,117.118v117.515c7.321,0,504.679,0,512,0 V117.118C512,104.482,501.744,94.226,489.107,94.226z"
        />

        {/* Destaque dourado */}
        <path
          style={{ fill: "#FFC72D" }}
          d="M489.107,94.226H256v125.146h256V117.118C512,104.482,501.744,94.226,489.107,94.226z"
        />

        {/* Corpo do troféu - parte prateada */}
        <path
          style={{ fill: "#D1D3D4" }}
          d="M0,219.372v248.766c0,12.637,10.256,22.893,22.893,22.893H256h233.107 c12.637,0,22.893-10.256,22.893-22.893V219.372C504.679,219.372,7.321,219.372,0,219.372z"
        />

        {/* Destaque prateado */}
        <path
          style={{ fill: "#BFC1C2" }}
          d="M512,219.372v248.766c0,12.637-10.256,22.893-22.893,22.893H256V219.372L512,219.372L512,219.372z"
        />

        {/* Haste esquerda */}
        <path
          style={{ fill: "#FF7876" }}
          d="M172.819,161.377c-12.643,0-22.893-10.25-22.893-22.893V43.862c0-12.643,10.25-22.893,22.893-22.893 c12.643,0,22.893,10.25,22.893,22.893v94.623C195.712,151.128,185.462,161.377,172.819,161.377z"
        />

        {/* Haste direita */}
        <path
          style={{ fill: "#FF5E5B" }}
          d="M339.172,161.377c-12.643,0-22.893-10.25-22.893-22.893V43.862c0-12.643,10.25-22.893,22.893-22.893 c12.643,0,22.893,10.25,22.893,22.893v94.623C362.064,151.128,351.815,161.377,339.172,161.377z"
        />

        {/* Detalhes decorativos - parte 1 */}
        <g>
          <path
            style={{ fill: "#A7A9AC" }}
            d="M93.269,314.84c15.263-23.26,42.922-23.038,58.042,0c14.085,20.965,13.914,54.071,0,74.781 c-15.42,23.132-42.602,23.164-58.042,0C79.282,369.279,78.993,335.602,93.269,314.84z M136.916,324.383 c-9.123-13.212-20.57-12.379-29.411,0c-10.1,15.512-9.897,40.694,0,55.539c8.963,12.849,20.641,13.005,29.411,0 C146.775,365.137,147.056,339.955,136.916,324.383z"
          />

          {/* Detalhes decorativos - parte 2 */}
          <path
            style={{ fill: "#A7A9AC" }}
            d="M349.267,314.84c15.263-23.26,42.922-23.038,58.042,0c14.085,20.965,13.914,54.071,0,74.781 c-15.42,23.132-42.602,23.164-58.042,0C335.28,369.279,334.992,335.602,349.267,314.84z M392.914,324.383 c-9.123-13.212-20.568-12.379-29.411,0c-10.1,15.512-9.897,40.694,0,55.539c8.963,12.849,20.641,13.005,29.411,0 C402.775,365.137,403.056,339.955,392.914,324.383z"
          />
        </g>
      </g>
    </svg>
  );
};
