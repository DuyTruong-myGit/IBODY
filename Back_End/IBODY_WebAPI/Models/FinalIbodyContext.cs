using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace IBODY_WebAPI.Models;

public partial class FinalIbodyContext : DbContext
{
    public FinalIbodyContext()
    {
    }

    public FinalIbodyContext(DbContextOptions<FinalIbodyContext> options)
        : base(options)
    {
    }

    public virtual DbSet<AspNetRole> AspNetRoles { get; set; }

    public virtual DbSet<AspNetRoleClaim> AspNetRoleClaims { get; set; }

    public virtual DbSet<AspNetUser> AspNetUsers { get; set; }

    public virtual DbSet<AspNetUserClaim> AspNetUserClaims { get; set; }

    public virtual DbSet<AspNetUserLogin> AspNetUserLogins { get; set; }

    public virtual DbSet<AspNetUserToken> AspNetUserTokens { get; set; }

    public virtual DbSet<BaoCaoViPham> BaoCaoViPhams { get; set; }

    public virtual DbSet<BinhLuan> BinhLuans { get; set; }

    public virtual DbSet<ChuyenGium> ChuyenGia { get; set; }

    public virtual DbSet<DanhGium> DanhGia { get; set; }

    public virtual DbSet<GiaoDich> GiaoDiches { get; set; }

    public virtual DbSet<GoiDichVu> GoiDichVus { get; set; }

    public virtual DbSet<HinhThucTuVan> HinhThucTuVans { get; set; }

    public virtual DbSet<HoaDon> HoaDons { get; set; }

    public virtual DbSet<HocVanChuyenGium> HocVanChuyenGia { get; set; }

    public virtual DbSet<LichHen> LichHens { get; set; }

    public virtual DbSet<NguoiDung> NguoiDungs { get; set; }

    public virtual DbSet<PhuongThucChung> PhuongThucChungs { get; set; }

    public virtual DbSet<PhuongThucNguoiDung> PhuongThucNguoiDungs { get; set; }

    public virtual DbSet<PhuongThucThanhToan> PhuongThucThanhToans { get; set; }

    public virtual DbSet<TaiKhoan> TaiKhoans { get; set; }

    public virtual DbSet<The> Thes { get; set; }

    public virtual DbSet<TheChuyenGium> TheChuyenGia { get; set; }

    public virtual DbSet<ThoiGianRanhChuyenGium> ThoiGianRanhChuyenGia { get; set; }

    public virtual DbSet<ThongBao> ThongBaos { get; set; }

    public virtual DbSet<TinNhan> TinNhans { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Server=DUYTRUONG;Database=Final_IBODY;Trusted_Connection=True;TrustServerCertificate=True;");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AspNetRole>(entity =>
        {
            entity.HasIndex(e => e.NormalizedName, "RoleNameIndex")
                .IsUnique()
                .HasFilter("([NormalizedName] IS NOT NULL)");

            entity.Property(e => e.Name).HasMaxLength(256);
            entity.Property(e => e.NormalizedName).HasMaxLength(256);
        });

        modelBuilder.Entity<AspNetRoleClaim>(entity =>
        {
            entity.HasIndex(e => e.RoleId, "IX_AspNetRoleClaims_RoleId");

            entity.HasOne(d => d.Role).WithMany(p => p.AspNetRoleClaims).HasForeignKey(d => d.RoleId);
        });

        modelBuilder.Entity<AspNetUser>(entity =>
        {
            entity.HasIndex(e => e.NormalizedEmail, "EmailIndex");

            entity.HasIndex(e => e.NormalizedUserName, "UserNameIndex")
                .IsUnique()
                .HasFilter("([NormalizedUserName] IS NOT NULL)");

            entity.Property(e => e.Email).HasMaxLength(256);
            entity.Property(e => e.NormalizedEmail).HasMaxLength(256);
            entity.Property(e => e.NormalizedUserName).HasMaxLength(256);
            entity.Property(e => e.UserName).HasMaxLength(256);

            entity.HasMany(d => d.Roles).WithMany(p => p.Users)
                .UsingEntity<Dictionary<string, object>>(
                    "AspNetUserRole",
                    r => r.HasOne<AspNetRole>().WithMany().HasForeignKey("RoleId"),
                    l => l.HasOne<AspNetUser>().WithMany().HasForeignKey("UserId"),
                    j =>
                    {
                        j.HasKey("UserId", "RoleId");
                        j.ToTable("AspNetUserRoles");
                        j.HasIndex(new[] { "RoleId" }, "IX_AspNetUserRoles_RoleId");
                    });
        });

        modelBuilder.Entity<AspNetUserClaim>(entity =>
        {
            entity.HasIndex(e => e.UserId, "IX_AspNetUserClaims_UserId");

            entity.HasOne(d => d.User).WithMany(p => p.AspNetUserClaims).HasForeignKey(d => d.UserId);
        });

        modelBuilder.Entity<AspNetUserLogin>(entity =>
        {
            entity.HasKey(e => new { e.LoginProvider, e.ProviderKey });

            entity.HasIndex(e => e.UserId, "IX_AspNetUserLogins_UserId");

            entity.HasOne(d => d.User).WithMany(p => p.AspNetUserLogins).HasForeignKey(d => d.UserId);
        });

        modelBuilder.Entity<AspNetUserToken>(entity =>
        {
            entity.HasKey(e => new { e.UserId, e.LoginProvider, e.Name });

            entity.HasOne(d => d.User).WithMany(p => p.AspNetUserTokens).HasForeignKey(d => d.UserId);
        });

        modelBuilder.Entity<BaoCaoViPham>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__bao_cao___3213E83F7FD0945C");

            entity.ToTable("bao_cao_vi_pham");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.DoiTuongId).HasColumnName("doi_tuong_id");
            entity.Property(e => e.LoaiDoiTuong)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("loai_doi_tuong");
            entity.Property(e => e.LyDo).HasColumnName("ly_do");
            entity.Property(e => e.NguoiBaoCaoId).HasColumnName("nguoi_bao_cao_id");
            entity.Property(e => e.ThoiGian)
                .HasColumnType("datetime")
                .HasColumnName("thoi_gian");

            entity.HasOne(d => d.NguoiBaoCao).WithMany(p => p.BaoCaoViPhams)
                .HasForeignKey(d => d.NguoiBaoCaoId)
                .HasConstraintName("FK__bao_cao_v__nguoi__71D1E811");
        });

        modelBuilder.Entity<BinhLuan>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__binh_lua__3213E83FA003E0D3");

            entity.ToTable("binh_luan");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.DoiTuongId).HasColumnName("doi_tuong_id");
            entity.Property(e => e.LoaiDoiTuong)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("loai_doi_tuong");
            entity.Property(e => e.NguoiBinhLuanId).HasColumnName("nguoi_binh_luan_id");
            entity.Property(e => e.NoiDung).HasColumnName("noi_dung");
            entity.Property(e => e.ThoiGian)
                .HasColumnType("datetime")
                .HasColumnName("thoi_gian");

            entity.HasOne(d => d.NguoiBinhLuan).WithMany(p => p.BinhLuans)
                .HasForeignKey(d => d.NguoiBinhLuanId)
                .HasConstraintName("FK__binh_luan__nguoi__5812160E");
        });

        modelBuilder.Entity<ChuyenGium>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__chuyen_g__3213E83F0A038242");

            entity.ToTable("chuyen_gia");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.ChuyenMon).HasColumnName("chuyen_mon");
            entity.Property(e => e.GioiThieu).HasColumnName("gioi_thieu");
            entity.Property(e => e.HoTen)
                .HasMaxLength(255)
                .HasColumnName("ho_ten");
            entity.Property(e => e.SoChungChi)
                .HasMaxLength(100)
                .HasColumnName("so_chung_chi");
            entity.Property(e => e.SoNamKinhNghiem).HasColumnName("so_nam_kinh_nghiem");
            entity.Property(e => e.TaiKhoanId).HasColumnName("tai_khoan_id");
            entity.Property(e => e.TrangThai)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("trang_thai");

            entity.HasOne(d => d.TaiKhoan).WithMany(p => p.ChuyenGia)
                .HasForeignKey(d => d.TaiKhoanId)
                .HasConstraintName("FK__chuyen_gi__tai_k__403A8C7D");
        });

        modelBuilder.Entity<DanhGium>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__danh_gia__3213E83FBA15BE60");

            entity.ToTable("danh_gia");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.ChuyenGiaId).HasColumnName("chuyen_gia_id");
            entity.Property(e => e.DiemSo).HasColumnName("diem_so");
            entity.Property(e => e.LichHenId).HasColumnName("lich_hen_id");
            entity.Property(e => e.NguoiDungId).HasColumnName("nguoi_dung_id");
            entity.Property(e => e.NhanXet).HasColumnName("nhan_xet");

            entity.HasOne(d => d.ChuyenGia).WithMany(p => p.DanhGia)
                .HasForeignKey(d => d.ChuyenGiaId)
                .HasConstraintName("FK__danh_gia__chuyen__5441852A");

            entity.HasOne(d => d.LichHen).WithMany(p => p.DanhGia)
                .HasForeignKey(d => d.LichHenId)
                .HasConstraintName("FK__danh_gia__lich_h__52593CB8");

            entity.HasOne(d => d.NguoiDung).WithMany(p => p.DanhGia)
                .HasForeignKey(d => d.NguoiDungId)
                .HasConstraintName("FK__danh_gia__nguoi___534D60F1");
        });

        modelBuilder.Entity<GiaoDich>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__giao_dic__3213E83FF90200C4");

            entity.ToTable("giao_dich");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.HoaDonId).HasColumnName("hoa_don_id");
            entity.Property(e => e.PhuongThucId).HasColumnName("phuong_thuc_id");
            entity.Property(e => e.SoTien)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("so_tien");
            entity.Property(e => e.ThoiGian)
                .HasColumnType("datetime")
                .HasColumnName("thoi_gian");

            entity.HasOne(d => d.HoaDon).WithMany(p => p.GiaoDiches)
                .HasForeignKey(d => d.HoaDonId)
                .HasConstraintName("FK__giao_dich__hoa_d__6E01572D");

            entity.HasOne(d => d.PhuongThuc).WithMany(p => p.GiaoDiches)
                .HasForeignKey(d => d.PhuongThucId)
                .HasConstraintName("FK__giao_dich__phuon__6EF57B66");
        });

        modelBuilder.Entity<GoiDichVu>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__goi_dich__3213E83F745514DC");

            entity.ToTable("goi_dich_vu");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.DanhCho)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("danh_cho");
            entity.Property(e => e.Gia)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("gia");
            entity.Property(e => e.MoTa).HasColumnName("mo_ta");
            entity.Property(e => e.Ten)
                .HasMaxLength(255)
                .HasColumnName("ten");
            entity.Property(e => e.ThoiHanNgay).HasColumnName("thoi_han_ngay");
        });

        modelBuilder.Entity<HinhThucTuVan>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__hinh_thu__3213E83F76F0D4A8");

            entity.ToTable("hinh_thuc_tu_van");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.GiaCoBan)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("gia_co_ban");
            entity.Property(e => e.Ten)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("ten");
            entity.Property(e => e.ThoiLuongPhut).HasColumnName("thoi_luong_phut");
        });

        modelBuilder.Entity<HoaDon>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__hoa_don__3213E83F380EA224");

            entity.ToTable("hoa_don");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.GoiDichVuId).HasColumnName("goi_dich_vu_id");
            entity.Property(e => e.TaiKhoanId).HasColumnName("tai_khoan_id");
            entity.Property(e => e.ThoiGianTao)
                .HasColumnType("datetime")
                .HasColumnName("thoi_gian_tao");
            entity.Property(e => e.TongTien)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("tong_tien");

            entity.HasOne(d => d.GoiDichVu).WithMany(p => p.HoaDons)
                .HasForeignKey(d => d.GoiDichVuId)
                .HasConstraintName("FK__hoa_don__goi_dic__6754599E");

            entity.HasOne(d => d.TaiKhoan).WithMany(p => p.HoaDons)
                .HasForeignKey(d => d.TaiKhoanId)
                .HasConstraintName("FK__hoa_don__tai_kho__66603565");
        });

        modelBuilder.Entity<HocVanChuyenGium>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__hoc_van___3213E83F80962516");

            entity.ToTable("hoc_van_chuyen_gia");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.BangCap)
                .HasMaxLength(255)
                .HasColumnName("bang_cap");
            entity.Property(e => e.ChuyenGiaId).HasColumnName("chuyen_gia_id");
            entity.Property(e => e.ChuyenNganh)
                .HasMaxLength(255)
                .HasColumnName("chuyen_nganh");
            entity.Property(e => e.NamTotNghiep).HasColumnName("nam_tot_nghiep");
            entity.Property(e => e.Truong)
                .HasMaxLength(255)
                .HasColumnName("truong");

            entity.HasOne(d => d.ChuyenGia).WithMany(p => p.HocVanChuyenGia)
                .HasForeignKey(d => d.ChuyenGiaId)
                .HasConstraintName("FK__hoc_van_c__chuye__440B1D61");
        });

        modelBuilder.Entity<LichHen>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__lich_hen__3213E83FA1A18319");

            entity.ToTable("lich_hen");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.ChuyenGiaId).HasColumnName("chuyen_gia_id");
            entity.Property(e => e.HinhThucId).HasColumnName("hinh_thuc_id");
            entity.Property(e => e.NguoiDungId).HasColumnName("nguoi_dung_id");
            entity.Property(e => e.ThoiGianBatDau)
                .HasColumnType("datetime")
                .HasColumnName("thoi_gian_bat_dau");
            entity.Property(e => e.ThoiGianKetThuc)
                .HasColumnType("datetime")
                .HasColumnName("thoi_gian_ket_thuc");
            entity.Property(e => e.TomTat).HasColumnName("tom_tat");

            entity.HasOne(d => d.ChuyenGia).WithMany(p => p.LichHens)
                .HasForeignKey(d => d.ChuyenGiaId)
                .HasConstraintName("FK__lich_hen__chuyen__4E88ABD4");

            entity.HasOne(d => d.HinhThuc).WithMany(p => p.LichHens)
                .HasForeignKey(d => d.HinhThucId)
                .HasConstraintName("FK__lich_hen__hinh_t__4F7CD00D");

            entity.HasOne(d => d.NguoiDung).WithMany(p => p.LichHens)
                .HasForeignKey(d => d.NguoiDungId)
                .HasConstraintName("FK__lich_hen__nguoi___4D94879B");
        });

        modelBuilder.Entity<NguoiDung>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__nguoi_du__3213E83F383FAAE5");

            entity.ToTable("nguoi_dung");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.GioiTinh)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("gioi_tinh");
            entity.Property(e => e.HoTen)
                .HasMaxLength(255)
                .HasColumnName("ho_ten");
            entity.Property(e => e.MucTieuTamLy).HasColumnName("muc_tieu_tam_ly");
            entity.Property(e => e.NgaySinh).HasColumnName("ngay_sinh");
            entity.Property(e => e.TaiKhoanId).HasColumnName("tai_khoan_id");

            entity.HasOne(d => d.TaiKhoan).WithMany(p => p.NguoiDungs)
                .HasForeignKey(d => d.TaiKhoanId)
                .HasConstraintName("FK__nguoi_dun__tai_k__3C69FB99");
        });

        modelBuilder.Entity<PhuongThucChung>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__phuong_t__3213E83F17F69BD4");

            entity.ToTable("phuong_thuc_chung");

            entity.HasIndex(e => e.Ten, "UQ__phuong_t__DC107AB1F0C16E62").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.MoTa).HasColumnName("mo_ta");
            entity.Property(e => e.Ten)
                .HasMaxLength(50)
                .HasColumnName("ten");
            entity.Property(e => e.TrangThai)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasDefaultValue("hien")
                .HasColumnName("trang_thai");
        });

        modelBuilder.Entity<PhuongThucNguoiDung>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__phuong_t__3213E83FD1E8162F");

            entity.ToTable("phuong_thuc_nguoi_dung");

            entity.HasIndex(e => new { e.TaiKhoanId, e.PhuongThucId }, "UQ__phuong_t__FFAAD5A0994770B4").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.ChiTiet)
                .HasMaxLength(255)
                .HasColumnName("chi_tiet");
            entity.Property(e => e.DaXacThuc)
                .HasDefaultValue(false)
                .HasColumnName("da_xac_thuc");
            entity.Property(e => e.NgayTao)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("ngay_tao");
            entity.Property(e => e.PhuongThucId).HasColumnName("phuong_thuc_id");
            entity.Property(e => e.TaiKhoanId).HasColumnName("tai_khoan_id");

            entity.HasOne(d => d.PhuongThuc).WithMany(p => p.PhuongThucNguoiDungs)
                .HasForeignKey(d => d.PhuongThucId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__phuong_th__phuon__17036CC0");

            entity.HasOne(d => d.TaiKhoan).WithMany(p => p.PhuongThucNguoiDungs)
                .HasForeignKey(d => d.TaiKhoanId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__phuong_th__tai_k__160F4887");
        });

        modelBuilder.Entity<PhuongThucThanhToan>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__phuong_t__3213E83F8EEF827F");

            entity.ToTable("phuong_thuc_thanh_toan");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.ChiTiet).HasColumnName("chi_tiet");
            entity.Property(e => e.Loai)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("loai");
            entity.Property(e => e.TaiKhoanId).HasColumnName("tai_khoan_id");

            entity.HasOne(d => d.TaiKhoan).WithMany(p => p.PhuongThucThanhToans)
                .HasForeignKey(d => d.TaiKhoanId)
                .HasConstraintName("FK__phuong_th__tai_k__6A30C649");
        });

        modelBuilder.Entity<TaiKhoan>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__tai_khoa__3213E83FFEC7DD92");

            entity.ToTable("tai_khoan");

            entity.HasIndex(e => e.Email, "UQ__tai_khoa__AB6E6164DF8A630F").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Email)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("email");
            entity.Property(e => e.MatKhau)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("mat_khau");
            entity.Property(e => e.TrangThai)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("trang_thai");
            entity.Property(e => e.VaiTro)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("vai_tro");
        });

        modelBuilder.Entity<The>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__the__3213E83F537AD6B7");

            entity.ToTable("the");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Ten)
                .HasMaxLength(100)
                .HasColumnName("ten");
        });

        modelBuilder.Entity<TheChuyenGium>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__the_chuy__3213E83FC2762867");

            entity.ToTable("the_chuyen_gia");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.ChuyenGiaId).HasColumnName("chuyen_gia_id");
            entity.Property(e => e.TheId).HasColumnName("the_id");

            entity.HasOne(d => d.ChuyenGia).WithMany(p => p.TheChuyenGia)
                .HasForeignKey(d => d.ChuyenGiaId)
                .HasConstraintName("FK__the_chuye__chuye__778AC167");

            entity.HasOne(d => d.The).WithMany(p => p.TheChuyenGia)
                .HasForeignKey(d => d.TheId)
                .HasConstraintName("FK__the_chuye__the_i__787EE5A0");
        });

        modelBuilder.Entity<ThoiGianRanhChuyenGium>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__thoi_gia__3213E83F21A6DC12");

            entity.ToTable("thoi_gian_ranh_chuyen_gia");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.ChuyenGiaId).HasColumnName("chuyen_gia_id");
            entity.Property(e => e.Den).HasColumnName("den");
            entity.Property(e => e.ThuTrongTuan).HasColumnName("thu_trong_tuan");
            entity.Property(e => e.Tu).HasColumnName("tu");

            entity.HasOne(d => d.ChuyenGia).WithMany(p => p.ThoiGianRanhChuyenGia)
                .HasForeignKey(d => d.ChuyenGiaId)
                .HasConstraintName("FK__thoi_gian__chuye__46E78A0C");
        });

        modelBuilder.Entity<ThongBao>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__thong_ba__3213E83F054AD3C4");

            entity.ToTable("thong_bao");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.DaDocLuc)
                .HasColumnType("datetime")
                .HasColumnName("da_doc_luc");
            entity.Property(e => e.Loai)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("loai");
            entity.Property(e => e.NoiDung).HasColumnName("noi_dung");
            entity.Property(e => e.TaiKhoanId).HasColumnName("tai_khoan_id");

            entity.HasOne(d => d.TaiKhoan).WithMany(p => p.ThongBaos)
                .HasForeignKey(d => d.TaiKhoanId)
                .HasConstraintName("FK__thong_bao__tai_k__5FB337D6");
        });

        modelBuilder.Entity<TinNhan>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__tin_nhan__3213E83F3CCFA432");

            entity.ToTable("tin_nhan");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.NguoiGuiId).HasColumnName("nguoi_gui_id");
            entity.Property(e => e.NguoiNhanId).HasColumnName("nguoi_nhan_id");
            entity.Property(e => e.NoiDung).HasColumnName("noi_dung");
            entity.Property(e => e.ThoiGian)
                .HasColumnType("datetime")
                .HasColumnName("thoi_gian");

            entity.HasOne(d => d.NguoiGui).WithMany(p => p.TinNhanNguoiGuis)
                .HasForeignKey(d => d.NguoiGuiId)
                .HasConstraintName("FK__tin_nhan__nguoi___5BE2A6F2");

            entity.HasOne(d => d.NguoiNhan).WithMany(p => p.TinNhanNguoiNhans)
                .HasForeignKey(d => d.NguoiNhanId)
                .HasConstraintName("FK__tin_nhan__nguoi___5CD6CB2B");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
