import membershipsBanner from "@/assets/memberships-banner.jpg";

const MembershipsBanner = () => {
  return (
    <div className="rounded-xl overflow-hidden shadow-lg">
      <img 
        src={membershipsBanner} 
        alt="Conoce las membresías Free Fire" 
        className="w-full h-auto object-cover"
      />
    </div>
  );
};

export default MembershipsBanner;
