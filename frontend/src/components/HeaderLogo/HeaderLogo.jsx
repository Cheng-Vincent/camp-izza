import yss_logo_blue from "../../assets/yss-logo.png";
const HeaderLogo = ({ href }) => {
  return (
    <>
      <div>
        <div style={{ textAlign: "center" }}>
          <a href={href}>
            <img
              className="col"
              class="logo"
              alt="YSS Logo"
              src={yss_logo_blue}
              style={{
                width: "175px",
                height: "auto",
                objectFit: "scale-down",
              }}
            ></img>
          </a>
        </div>
      </div>
    </>
  );
};

export default HeaderLogo;
